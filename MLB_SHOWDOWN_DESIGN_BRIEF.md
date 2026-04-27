# Claude Cowork / Claude Design — DFS MLB Showdown Builder Prototype Brief

## What I want you to help me build

A **prototype frontend** for a DraftKings MLB Showdown lineup builder. This is the visual/UX layer of a larger system. Your job is to design and build a polished, interactive HTML prototype that shows the workflow and look-and-feel. A separate Claude Code session will later wire this prototype up to a real Python backend that does the heavy lifting (data ingestion, ML model training, lineup generation, scoring).

For the prototype, **use mock data**. The goal is design + UX validation before backend work begins.

## Important context: how the handoff will work

After we prototype this together, I will hand off the prototype + an architecture brief to **Claude Code**, who will:

1. Build the **Python backend** (FastAPI server) — data pipeline, ML predictor, lineup generator
2. Wire the prototype frontend to the Python API
3. Package it so I double-click a `.bat` file on my Desktop and it opens in my browser (just like my current OPTO tool)

So the prototype should be designed with this in mind: **it should be a single-page React app** (similar to a recent project — see "Reference: Madden Classic Builder" below), structured cleanly enough that Claude Code can later swap mock data for real API calls without redesigning anything.

## Reference: Madden Classic Builder

I recently built a Madden Classic DFS optimizer with you (Claude Design) and Claude Code. It came out really well. Match that aesthetic and structural quality. Specifically:

- **Dark theme**: deep navy/slate backgrounds (#050a18, #0a1628), NOT pure black
- **Primary accent**: Cyan #22d3ee
- **Secondary accents**: Purple #a78bfa, Amber #fbbf24, Emerald #34d399
- **Typography**: JetBrains Mono for data, Outfit for headings (Google Fonts)
- **Cards**: Glass morphism — backdrop-filter blur, low-opacity cyan borders
- **Position color coding**: each position gets its own color throughout
- **Step-wizard nav** at the top with progress indicators
- **Animated progress bars** during long-running operations
- **Recharts** for all data visualization
- **Sortable tables** with sticky headers, **paginated** lineup browsers

That project's final form was a single self-contained `.html` file using React + Babel standalone via CDN, so the user could double-click to open it. Use that same pattern for this prototype.

## What the app does (workflow Rob walks through)

This is a 5-step wizard, similar to the Madden builder:

### Step 1: 📥 Ingest
Shows the status of captured data files on disk. Cowork has been auto-capturing SaberSim contest flashback data daily. This step shows:
- How many slates have been captured
- How many contests per slate
- A timeline/calendar view of capture history (last 30 days)
- Last capture timestamp + status (success/error)
- A button: **"Run Backfill"** — opens a date-range modal to backfill historical data
- A button: **"Import Latest"** — pulls today's captured files into the local database

(For prototype: show mock captured data — pretend 14 days have been captured, with realistic-looking slate counts.)

### Step 2: 🧠 Train
Shows the ML model status:
- Last training timestamp
- Training corpus size (e.g., "847 lineups across 23 slates")
- Model performance metrics: RMSE, R², top-decile precision
- A chart showing predicted vs. actual Sim ROI (scatter plot)
- A feature importance bar chart (geomean projection, summed ownership, CPT proj, stack composition, etc.)
- A button: **"Retrain Model"**
- A list of saved model versions with timestamps and metrics — user can switch which is active

### Step 3: ⚙️ Configure Build
User picks a target slate and contest:
- Dropdown: **Slate** (e.g., "Apr 26, 7:05pm — BOS @ BAL")
- Dropdown: **Target Contest** (e.g., "$10K Extra Inning [50% to 1st]")
- Slider: **Number of Lineups** (1–150, default 30)
- Slider: **Minimum Salary Used** ($48,000–$50,000, default $49,000)
- Slider: **Max CPT Concentration** (10%–50%, default 30% — caps how many lineups can share the same captain)
- Slider: **Min Hamming Distance** (1–4, default 2 — minimum player differences between any two selected lineups)
- Toggle: **Force Lock** — let user click players in the slate projections table to lock them into all lineups
- Toggle: **Exclude Players** — same but for exclusions
- Reference panel showing the loaded slate's player pool (sortable table: player, team, position, salary, projection, ownership)

### Step 4: 🔨 Build
Big button: **"Build Lineups"** — kicks off the candidate generation + scoring pipeline.
While building, show:
- Animated progress bar with phase labels: "Generating candidates..." → "Scoring..." → "Selecting diverse top-N..."
- Live stats: candidates generated, candidates scored, lineups selected
- A cancel button

When complete:
- A summary card: count of lineups, avg predicted Sim ROI, salary distribution
- A chart: predicted Sim ROI distribution across selected lineups (histogram)
- A chart: CPT exposure (which players are most-used as captain across the build)
- A chart: player exposure across all 6 slots (top 15)
- The lineup table (paginated, 25 per page) with columns:
  - Rank, CPT, UTIL × 5, Salary, Predicted Sim ROI, Stack composition (e.g., "5", "4|2", "3|3"), Lineup Hash (short)

### Step 5: 🏆 Export
- Big "**Download DK CSV**" button (downloads a CSV in DraftKings' upload format)
- Below the button, a preview table of the CSV content
- A "**Generate HTML Report**" button — produces a self-contained HTML file with the full build details (lineups, charts, slate context, model metadata) for archival
- Below: a contest summary card showing the target contest details (max entries, prize pool, top prize, payout structure)
- Final summary stats: total entry fees, expected portfolio Sim ROI, diversity metrics

## DraftKings MLB Showdown rules (use these for mock data realism)

- **Roster**: 1 CPT + 5 UTIL = 6 players total
- **Salary cap**: $50,000
- **Same-game requirement**: all 6 players from the same MLB game
- **CPT salary multiplier**: CPT salary = base × 1.5
- **CPT scoring multiplier**: CPT points = base × 1.5
- **Positions in MLB Showdown**: P (pitcher), C, 1B, 2B, 3B, SS, OF (any non-pitcher fills CPT or UTIL)
- A typical slate has ~26-30 players (both teams' rosters)

## Mock data for the prototype

Generate realistic mock data for one slate. Suggested:
- **Slate**: "Apr 26, 7:05pm ET — BOS @ BAL"
- **Players**: Mock names, real-feeling salaries ($2,200 - $11,500), projections (4-22), ownership (5%-45%)
- **Contests**: 3 mock contests at different fee tiers ($3, $10, $50)
- **Lineups**: ~30 mock built lineups with computed Sim ROI predictions

For the Ingest step, mock 14 days of capture history with mostly green checks and one error for realism.

For the Train step, mock metrics: RMSE 0.42, R² 0.31, top-decile precision 0.18.

## Visual / UX details that matter

- **Smooth fade-in transitions** between steps
- **Live progress bars** with pulse-glow effect during builds (cyan glow that intensifies)
- **Position badges** with color coding (P=red, OF=blue, INF=green, etc. — you choose the palette but be consistent)
- **Player stack visualization** in lineup rows — small colored chips showing the team distribution
- **Captain indicator** — a star or crown icon next to the CPT in every lineup row
- **Hover tooltips** on every chart with rich detail
- **Sortable table headers** with arrow indicators
- **Empty states** — what does each step look like before data is loaded? Design those with care.
- **Error states** — what does it look like if a build fails or the model isn't trained yet? Design those too.

## Multi-sport plan (design with this in mind, but only build MLB Showdown for prototype)

Eventually this app will support:
- MLB Showdown (V1, this prototype)
- MLB Classic
- NHL Classic + Showdown
- NBA Classic + Showdown
- NFL Classic + Showdown

So the **top-level navigation** should include a **sport/format selector** (probably a dropdown or pill-tab row at the very top of the header) — even though only "MLB Showdown" is functional in the prototype, the others should appear disabled/coming-soon. This signals to Claude Code that the architecture needs to be sport-agnostic.

## Deliverable

A **single self-contained `.html` file** I can double-click to open. Same pattern as the Madden builder. Use:

```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script crossorigin src="https://unpkg.com/recharts@2/umd/Recharts.js"></script>
```

JSX in `<script type="text/babel">`. All styles inline.

When you hand off to Claude Code, include:

1. The finished prototype `.html` file
2. A short architecture note explaining: "This is the frontend prototype. Build a Python FastAPI backend that exposes endpoints matching the mock data shapes used here. Replace mock data calls with `fetch()` calls to the local Python API. Package as a `.bat` file that starts the Python server and opens the browser."
3. The full project brief I will paste below this instruction set, which describes the backend architecture in detail.

---

## Full project brief (for Claude Code, after prototype is approved)

[PASTE THE FULL "DraftKings MLB Showdown Lineup Builder — Project Brief" HERE]

---

Ready when you are. Start with a wireframe sketch of the 5 steps so we can iterate on layout before you start coding, then build the full prototype.
