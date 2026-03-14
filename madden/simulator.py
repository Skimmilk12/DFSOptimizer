"""
Monte Carlo contest simulator for DraftKings Madden Classic.
Simulates contest outcomes by randomizing player scores and
estimating expected value, ROI, and finish distributions.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Optional

import numpy as np

from madden.models import Player, Lineup, ContestResult


@dataclass
class PayoutStructure:
    """Maps rank ranges to payout amounts."""
    name: str
    entry_fee: float
    total_entries: int
    prize_pool: float
    payouts: list[tuple[int, int, float]]  # (rank_start, rank_end, payout)

    def get_payout(self, rank: int) -> float:
        for start, end, amount in self.payouts:
            if start <= rank <= end:
                return amount
        return 0.0


# Common DraftKings Madden Classic contest structures
SINGLE_ENTRY_20 = PayoutStructure(
    name="$20 Madden Classic (Single Entry)",
    entry_fee=20.0,
    total_entries=4484,
    prize_pool=80000.0,
    payouts=[
        (1, 1, 10000.0),
        (2, 2, 5000.0),
        (3, 3, 3000.0),
        (4, 4, 2000.0),
        (5, 5, 1500.0),
        (6, 10, 500.0),
        (11, 20, 200.0),
        (21, 50, 100.0),
        (51, 100, 60.0),
        (101, 200, 40.0),
        (201, 500, 30.0),
        (501, 1000, 25.0),
    ],
)

DOUBLE_UP_5 = PayoutStructure(
    name="$5 Madden Double Up",
    entry_fee=5.0,
    total_entries=100,
    prize_pool=450.0,
    payouts=[
        (1, 45, 10.0),
    ],
)

GPP_3 = PayoutStructure(
    name="$3 Madden GPP",
    entry_fee=3.0,
    total_entries=10000,
    prize_pool=27000.0,
    payouts=[
        (1, 1, 5000.0),
        (2, 2, 2500.0),
        (3, 3, 1000.0),
        (4, 5, 500.0),
        (6, 10, 200.0),
        (11, 25, 100.0),
        (26, 50, 50.0),
        (51, 150, 20.0),
        (151, 500, 10.0),
        (501, 1500, 6.0),
    ],
)

DEFAULT_STRUCTURES = [SINGLE_ENTRY_20, DOUBLE_UP_5, GPP_3]


def simulate_player_score(player: Player, correlation_noise: float = 0.0) -> float:
    """
    Simulate a single player's score using a skewed normal distribution.
    correlation_noise is shared team-level noise for correlated outcomes.
    """
    std = player.std_dev if player.std_dev > 0 else player.projected_points * 0.3
    base = np.random.normal(player.projected_points + correlation_noise, std)
    # Slight positive skew (big games happen)
    if random.random() < 0.08:
        base += abs(np.random.normal(0, std * 0.8))
    return max(0, base)


def simulate_lineup_score(lineup: Lineup, team_correlations: Optional[dict] = None) -> float:
    """
    Simulate total lineup score with optional team-level correlation.
    Players on the same team share some variance.
    """
    if team_correlations is None:
        team_correlations = {}
        teams = set(p.team for p in lineup.players)
        for team in teams:
            team_correlations[team] = np.random.normal(0, 2.5)

    total = 0.0
    for player in lineup.players:
        corr = team_correlations.get(player.team, 0.0)
        total += simulate_player_score(player, corr)
    return total


def simulate_opponent_scores(
    players: list[Player],
    payout: PayoutStructure,
    n_opponents: Optional[int] = None,
) -> list[float]:
    """
    Simulate opponent lineup scores for a contest.
    Uses ownership-weighted random lineup construction.
    """
    n = n_opponents or (payout.total_entries - 1)
    scores = []
    for _ in range(n):
        # Build a rough opponent lineup using ownership-weighted sampling
        score = _simulate_random_opponent(players)
        scores.append(score)
    return scores


def _simulate_random_opponent(players: list[Player]) -> float:
    """Generate a simulated score for one random opponent lineup."""
    from madden.config import POSITION_LIMITS, SALARY_CAP

    by_pos = {}
    for p in players:
        by_pos.setdefault(p.position, []).append(p)

    # Weight by ownership (or uniform if no ownership data)
    selected = []
    remaining_salary = SALARY_CAP
    targets = {"QB": 1, "RB": 2, "WR": 3, "TE": 1, "DST": 1}  # base slots
    flex_pos = ["RB", "WR", "TE"]

    team_correlations = {}

    for pos, count in targets.items():
        pool = [p for p in by_pos.get(pos, []) if p.salary <= remaining_salary]
        if not pool:
            continue
        weights = [max(p.ownership, 1.0) for p in pool]
        chosen = _weighted_sample(pool, weights, min(count, len(pool)))
        for p in chosen:
            remaining_salary -= p.salary
            if p.team not in team_correlations:
                team_correlations[p.team] = np.random.normal(0, 2.5)
            selected.append(p)

    # FLEX
    flex_pool = [
        p for p in players
        if p.position in flex_pos and p not in selected and p.salary <= remaining_salary
    ]
    if flex_pool:
        weights = [max(p.ownership, 1.0) for p in flex_pool]
        chosen = _weighted_sample(flex_pool, weights, 1)
        for p in chosen:
            if p.team not in team_correlations:
                team_correlations[p.team] = np.random.normal(0, 2.5)
            selected.append(p)

    total = 0.0
    for p in selected:
        corr = team_correlations.get(p.team, 0.0)
        total += simulate_player_score(p, corr)
    return total


def _weighted_sample(items, weights, k):
    """Weighted sampling without replacement."""
    items = list(items)
    weights = list(weights)
    chosen = []
    for _ in range(min(k, len(items))):
        total = sum(weights)
        if total <= 0:
            break
        r = random.random() * total
        cumulative = 0
        for i, w in enumerate(weights):
            cumulative += w
            if r <= cumulative:
                chosen.append(items[i])
                items.pop(i)
                weights.pop(i)
                break
    return chosen


@dataclass
class SimulationResult:
    n_sims: int = 0
    avg_score: float = 0.0
    median_score: float = 0.0
    avg_rank: float = 0.0
    avg_payout: float = 0.0
    roi: float = 0.0
    cash_rate: float = 0.0  # % of sims that cash
    top10_rate: float = 0.0
    first_place_rate: float = 0.0
    score_distribution: list[float] = field(default_factory=list)
    rank_distribution: list[int] = field(default_factory=list)


def run_simulation(
    lineup: Lineup,
    players: list[Player],
    payout: PayoutStructure,
    n_sims: int = 1000,
    n_opponents: int = 100,
) -> SimulationResult:
    """
    Run Monte Carlo simulation of a lineup in a contest.

    Args:
        lineup: The lineup to simulate.
        players: Full player pool (for opponent simulation).
        payout: Contest payout structure.
        n_sims: Number of simulations to run.
        n_opponents: Number of opponent lineups per sim.

    Returns:
        SimulationResult with stats.
    """
    scores = []
    ranks = []
    payouts_earned = []

    for _ in range(n_sims):
        # Simulate our lineup
        team_corr = {}
        for p in lineup.players:
            if p.team not in team_corr:
                team_corr[p.team] = np.random.normal(0, 2.5)
        my_score = simulate_lineup_score(lineup, team_corr)

        # Simulate opponents
        opp_scores = simulate_opponent_scores(players, payout, n_opponents)

        # Rank (1-indexed)
        rank = 1 + sum(1 for s in opp_scores if s > my_score)
        # Scale rank to full contest size
        scaled_rank = int(rank * (payout.total_entries / (n_opponents + 1)))
        scaled_rank = max(1, min(scaled_rank, payout.total_entries))

        earned = payout.get_payout(scaled_rank)

        scores.append(my_score)
        ranks.append(scaled_rank)
        payouts_earned.append(earned)

    scores_arr = np.array(scores)
    ranks_arr = np.array(ranks)
    payouts_arr = np.array(payouts_earned)

    return SimulationResult(
        n_sims=n_sims,
        avg_score=float(np.mean(scores_arr)),
        median_score=float(np.median(scores_arr)),
        avg_rank=float(np.mean(ranks_arr)),
        avg_payout=float(np.mean(payouts_arr)),
        roi=float((np.mean(payouts_arr) - payout.entry_fee) / payout.entry_fee * 100),
        cash_rate=float(np.mean(payouts_arr > 0) * 100),
        top10_rate=float(np.mean(ranks_arr <= 10) * 100),
        first_place_rate=float(np.mean(ranks_arr == 1) * 100),
        score_distribution=scores,
        rank_distribution=ranks_arr.tolist(),
    )
