"""
DraftKings Madden Classic contest configuration.
Roster slots, salary cap, and scoring rules.
"""

# --- Roster Configuration ---
SALARY_CAP = 50000

ROSTER_SLOTS = [
    "QB",
    "RB1",
    "RB2",
    "WR1",
    "WR2",
    "WR3",
    "TE",
    "FLEX",   # RB/WR/TE
    "DST",
]

SLOT_ELIGIBLE_POSITIONS = {
    "QB": ["QB"],
    "RB1": ["RB"],
    "RB2": ["RB"],
    "WR1": ["WR"],
    "WR2": ["WR"],
    "WR3": ["WR"],
    "TE": ["TE"],
    "FLEX": ["RB", "WR", "TE"],
    "DST": ["DST"],
}

# Min/max players per position in a valid lineup
POSITION_LIMITS = {
    "QB": (1, 1),
    "RB": (2, 3),
    "WR": (3, 4),
    "TE": (1, 2),
    "DST": (1, 1),
}

LINEUP_SIZE = len(ROSTER_SLOTS)  # 9

# --- Scoring Rules (DraftKings Madden Classic) ---
PASSING_SCORING = {
    "passing_yard": 0.04,       # 1 pt per 25 yards
    "passing_td": 4.0,
    "interception": -1.0,
    "passing_300_bonus": 3.0,   # 300+ yard bonus
}

RUSHING_SCORING = {
    "rushing_yard": 0.1,        # 1 pt per 10 yards
    "rushing_td": 6.0,
    "rushing_100_bonus": 3.0,   # 100+ yard bonus
}

RECEIVING_SCORING = {
    "reception": 1.0,           # full PPR
    "receiving_yard": 0.1,      # 1 pt per 10 yards
    "receiving_td": 6.0,
    "receiving_100_bonus": 3.0, # 100+ yard bonus
}

MISC_SCORING = {
    "fumble_lost": -1.0,
    "two_point_conversion": 2.0,
    "return_td": 6.0,
}

DST_SCORING = {
    "sack": 1.0,
    "interception": 2.0,
    "fumble_recovery": 2.0,
    "defensive_td": 6.0,
    "safety": 2.0,
    "blocked_kick": 2.0,
    "points_allowed_0": 10.0,
    "points_allowed_1_6": 7.0,
    "points_allowed_7_13": 4.0,
    "points_allowed_14_20": 1.0,
    "points_allowed_21_27": 0.0,
    "points_allowed_28_34": -1.0,
    "points_allowed_35_plus": -4.0,
}
