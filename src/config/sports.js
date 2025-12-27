export const SPORTS = {
  NBA: {
    classic: {
      name: "NBA Classic",
      salaryCap: 50000,
      rosterSize: 8,
      slots: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'],
      minGames: 2,
      maxPerTeam: 4
    },
    showdown: {
      name: "NBA Showdown",
      salaryCap: 50000,
      rosterSize: 6,
      slots: ['CPT', 'FLEX', 'FLEX', 'FLEX', 'FLEX', 'FLEX'],
      captainMultiplier: 1.5,
      minGames: 1
    }
  },
  NFL: {
    classic: {
      name: "NFL Classic",
      salaryCap: 50000,
      rosterSize: 9,
      slots: ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'],
      minGames: 2,
      maxPerTeam: 4
    }
  },
  NHL: {
    classic: {
      name: "NHL Classic",
      salaryCap: 50000,
      rosterSize: 9,
      slots: ['C', 'C', 'W', 'W', 'W', 'D', 'D', 'G', 'UTIL'],
      minGames: 2
    }
  },
  MLB: {
    classic: {
      name: "MLB Classic",
      salaryCap: 50000,
      rosterSize: 10,
      slots: ['P', 'P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF'],
      minGames: 2
    }
  }
};

export const DEFAULT_SPORT = 'NBA';
export const DEFAULT_FORMAT = 'classic';
