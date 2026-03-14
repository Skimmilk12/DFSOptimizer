"""
Data models for players, lineups, and contest results.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from typing import Optional

from madden.config import (
    SALARY_CAP,
    LINEUP_SIZE,
    POSITION_LIMITS,
    SLOT_ELIGIBLE_POSITIONS,
)


@dataclass
class Player:
    name: str
    position: str  # QB, RB, WR, TE, DST
    team: str
    salary: int
    projected_points: float
    ceiling: float = 0.0
    floor: float = 0.0
    ownership: float = 0.0  # projected ownership %
    std_dev: float = 0.0    # for simulation

    @property
    def value(self) -> float:
        """Points per $1000 salary."""
        if self.salary == 0:
            return 0.0
        return self.projected_points / (self.salary / 1000)

    def __hash__(self):
        return hash((self.name, self.position, self.team))

    def __eq__(self, other):
        if not isinstance(other, Player):
            return False
        return (self.name, self.position, self.team) == (other.name, other.position, other.team)


@dataclass
class Lineup:
    players: list[Player] = field(default_factory=list)

    @property
    def total_salary(self) -> int:
        return sum(p.salary for p in self.players)

    @property
    def total_projected(self) -> float:
        return sum(p.projected_points for p in self.players)

    @property
    def remaining_salary(self) -> int:
        return SALARY_CAP - self.total_salary

    @property
    def is_valid(self) -> bool:
        if len(self.players) != LINEUP_SIZE:
            return False
        if self.total_salary > SALARY_CAP:
            return False
        pos_counts = {}
        for p in self.players:
            pos_counts[p.position] = pos_counts.get(p.position, 0) + 1
        for pos, (lo, hi) in POSITION_LIMITS.items():
            count = pos_counts.get(pos, 0)
            if count < lo or count > hi:
                return False
        return True

    def summary(self) -> str:
        lines = [f"{'Pos':<6}{'Name':<25}{'Team':<6}{'Salary':>8}{'Proj':>8}"]
        lines.append("-" * 53)
        for p in self.players:
            lines.append(
                f"{p.position:<6}{p.name:<25}{p.team:<6}{p.salary:>8,}{p.projected_points:>8.1f}"
            )
        lines.append("-" * 53)
        lines.append(
            f"{'Total':<37}{self.total_salary:>8,}{self.total_projected:>8.1f}"
        )
        lines.append(f"Remaining salary: ${self.remaining_salary:,}")
        return "\n".join(lines)


@dataclass
class ContestResult:
    lineup: Lineup
    simulated_score: float
    rank: int = 0
    payout: float = 0.0


def parse_players_csv(csv_text: str) -> list[Player]:
    """
    Parse a CSV with columns:
    Name, Position, Team, Salary, AvgPointsPerGame (projection),
    and optionally: Ceiling, Floor, Ownership, StdDev
    """
    reader = csv.DictReader(io.StringIO(csv_text))
    players = []
    for row in reader:
        # Normalize column names (strip whitespace, lowercase)
        row = {k.strip(): v.strip() for k, v in row.items()}
        # Support common DraftKings CSV column names
        name = row.get("Name") or row.get("name") or row.get("Player")
        position = row.get("Position") or row.get("position") or row.get("Roster Position") or ""
        team = row.get("Team") or row.get("team") or row.get("TeamAbbrev") or ""
        salary_str = row.get("Salary") or row.get("salary") or "0"
        salary = int(salary_str.replace(",", "").replace("$", ""))
        proj_str = (
            row.get("AvgPointsPerGame")
            or row.get("Projection")
            or row.get("projection")
            or row.get("Projected")
            or row.get("FPPG")
            or row.get("fppg")
            or "0"
        )
        projected = float(proj_str)
        ceiling = float(row.get("Ceiling") or row.get("ceiling") or projected * 1.5)
        floor = float(row.get("Floor") or row.get("floor") or projected * 0.3)
        ownership = float(row.get("Ownership") or row.get("ownership") or row.get("Own%") or "0")
        std_dev = float(row.get("StdDev") or row.get("std_dev") or row.get("Std Dev") or str(projected * 0.3))

        if name and position:
            # Normalize multi-position to primary
            pos = position.split("/")[0].strip().upper()
            players.append(
                Player(
                    name=name,
                    position=pos,
                    team=team.upper(),
                    salary=salary,
                    projected_points=projected,
                    ceiling=ceiling,
                    floor=floor,
                    ownership=ownership,
                    std_dev=std_dev,
                )
            )
    return players
