"""
Lineup optimizer using PuLP linear programming.
Builds optimal DraftKings Madden Classic lineups under salary cap
and roster constraints.
"""
from __future__ import annotations

import random
from typing import Optional

import pulp

from madden.config import SALARY_CAP, LINEUP_SIZE, POSITION_LIMITS
from madden.models import Player, Lineup


def optimize_lineup(
    players: list[Player],
    locked: Optional[list[Player]] = None,
    excluded: Optional[list[Player]] = None,
    max_exposure: float = 1.0,
    existing_lineups: Optional[list[Lineup]] = None,
) -> Optional[Lineup]:
    """
    Build a single optimal lineup using integer linear programming.

    Args:
        players: Pool of available players.
        locked: Players that must be in the lineup.
        excluded: Players that cannot be in the lineup.
        max_exposure: Max fraction of existing lineups a player can appear in (for multi-lineup).
        existing_lineups: Previously generated lineups (for diversity).

    Returns:
        Optimal Lineup or None if infeasible.
    """
    locked = locked or []
    excluded = excluded or []
    existing_lineups = existing_lineups or []

    prob = pulp.LpProblem("MaddenDFS", pulp.LpMaximize)

    # Binary variable: 1 if player is selected
    player_vars = {
        p: pulp.LpVariable(f"x_{i}", cat="Binary")
        for i, p in enumerate(players)
    }

    # Objective: maximize projected points
    prob += pulp.lpSum(p.projected_points * player_vars[p] for p in players)

    # Salary cap
    prob += pulp.lpSum(p.salary * player_vars[p] for p in players) <= SALARY_CAP

    # Exact lineup size
    prob += pulp.lpSum(player_vars[p] for p in players) == LINEUP_SIZE

    # Position constraints
    for pos, (lo, hi) in POSITION_LIMITS.items():
        pos_players = [p for p in players if p.position == pos]
        prob += pulp.lpSum(player_vars[p] for p in pos_players) >= lo
        prob += pulp.lpSum(player_vars[p] for p in pos_players) <= hi

    # Locked players
    for p in locked:
        if p in player_vars:
            prob += player_vars[p] == 1

    # Excluded players
    for p in excluded:
        if p in player_vars:
            prob += player_vars[p] == 0

    # Max exposure constraint for multi-lineup generation
    if existing_lineups and max_exposure < 1.0:
        max_count = max(1, int(len(existing_lineups) * max_exposure))
        for p in players:
            times_used = sum(1 for lu in existing_lineups if p in lu.players)
            if times_used >= max_count:
                prob += player_vars[p] == 0

    # Diversity: new lineup must differ from each existing by at least 2 players
    for lu in existing_lineups:
        overlap = [player_vars[p] for p in lu.players if p in player_vars]
        if overlap:
            prob += pulp.lpSum(overlap) <= LINEUP_SIZE - 2

    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    if prob.status != pulp.constants.LpStatusOptimal:
        return None

    selected = [p for p in players if player_vars[p].varValue and player_vars[p].varValue > 0.5]

    # Sort into roster order: QB, RB, RB, WR, WR, WR, TE, FLEX, DST
    order = {"QB": 0, "RB": 1, "WR": 2, "TE": 3, "DST": 4}
    selected.sort(key=lambda p: (order.get(p.position, 5), -p.projected_points))

    return Lineup(players=selected)


def generate_lineups(
    players: list[Player],
    count: int = 20,
    locked: Optional[list[Player]] = None,
    excluded: Optional[list[Player]] = None,
    max_exposure: float = 0.6,
    randomness: float = 0.0,
) -> list[Lineup]:
    """
    Generate multiple diverse optimal lineups.

    Args:
        players: Player pool.
        count: Number of lineups to generate.
        locked: Players locked into every lineup.
        excluded: Players excluded from all lineups.
        max_exposure: Max fraction of lineups any one player appears in.
        randomness: Add random noise (0-1 scale) to projections for variety.

    Returns:
        List of optimized lineups.
    """
    lineups = []
    for _ in range(count):
        pool = players
        if randomness > 0:
            pool = []
            for p in players:
                noise = random.gauss(0, p.projected_points * randomness * 0.15)
                noisy = Player(
                    name=p.name,
                    position=p.position,
                    team=p.team,
                    salary=p.salary,
                    projected_points=max(0, p.projected_points + noise),
                    ceiling=p.ceiling,
                    floor=p.floor,
                    ownership=p.ownership,
                    std_dev=p.std_dev,
                )
                pool.append(noisy)

        lu = optimize_lineup(
            pool,
            locked=locked,
            excluded=excluded,
            max_exposure=max_exposure,
            existing_lineups=lineups,
        )
        if lu is None:
            break
        # Replace noisy players with originals
        if randomness > 0:
            originals_by_key = {(p.name, p.position, p.team): p for p in players}
            lu.players = [
                originals_by_key.get((p.name, p.position, p.team), p)
                for p in lu.players
            ]
        lineups.append(lu)
    return lineups
