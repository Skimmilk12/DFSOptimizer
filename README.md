# DFS Cash Game Optimizer

A client-side web application for creating optimal DFS (Daily Fantasy Sports) lineups for cash games (Double-Ups and Head-to-Head contests). The optimizer finds the single highest projected points lineup within salary cap constraints.

## Features

- **CSV Upload**: Import SaberSim projections and DraftKings entries
- **MILP Optimization**: Uses Mixed Integer Linear Programming for optimal lineups
- **Late Swap Support**: Lock games that have started and re-optimize remaining positions
- **Multi-Entry Export**: Apply optimized lineup to all cash game entries
- **Player Exclusions**: Manually exclude players from the optimization pool
- **Configurable Filters**: Filter entries by keywords (Double Up, H2H usernames)

## Tech Stack

- **React + Vite** - Fast development and builds
- **Tailwind CSS** - Clean, functional UI
- **Papa Parse** - CSV parsing
- **javascript-lp-solver** - Mixed Integer Linear Programming

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### 1. Upload Projections

Upload a SaberSim format CSV with the following columns:
- `DFS ID` - Unique player identifier
- `Name` - Player name
- `Pos` - Position eligibility (e.g., "PG/G/UTIL")
- `Team` - Team abbreviation
- `Salary` - Player salary
- `My Proj` - Projected fantasy points
- `Game` - Game info (optional, for late swap)

### 2. Upload Entries (Optional)

Upload a DraftKings entries CSV to enable exporting your lineup to multiple entries.

### 3. Optimize

Click **OPTIMIZE** to generate the optimal lineup based on:
- Salary cap: $50,000
- Roster size: 8 players (NBA Classic)
- Minimum 2 different games
- Position eligibility constraints

### 4. Late Swap

If games have started:
1. The current lineup is preserved
2. Click the game lock buttons to lock games that have started
3. Click **OPTIMIZE** again to re-optimize unlocked positions

### 5. Export

Click **EXPORT LINEUPS** to download a CSV with your optimized lineup applied to all filtered cash game entries.

## DraftKings NBA Classic Constraints

| Parameter | Value |
|-----------|-------|
| Salary Cap | $50,000 |
| Roster Size | 8 players |
| Max Per Team | 4 players |
| Minimum Games | 2 |

### Roster Slots

| Slot | Accepts Positions |
|------|-------------------|
| PG | PG |
| SG | SG |
| SF | SF |
| PF | PF |
| C | C |
| G | PG, SG |
| F | SF, PF |
| UTIL | PG, SG, SF, PF, C |

## Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx      # Drag-drop CSV upload
│   ├── LineupCard.jsx      # Display optimal lineup
│   ├── GameLocks.jsx       # Toggle buttons for locking games
│   ├── EntryList.jsx       # Filtered cash entries table
│   ├── PlayerPool.jsx      # Collapsible player browser
│   └── FilterConfig.jsx    # Entry filter keywords
├── lib/
│   ├── optimizer.js        # MILP solver logic
│   ├── csvParser.js        # Papa Parse wrappers
│   └── exportLineup.js     # Generate export CSV
├── config/
│   └── sports.js           # Sport/slate configurations
├── App.jsx                 # Main layout
└── main.jsx                # Entry point
```

## Supported Sports

- NBA Classic (default)
- NBA Showdown
- NFL Classic
- NHL Classic
- MLB Classic

## License

MIT
