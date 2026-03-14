"""
DraftKings Madden Classic Contest Simulator & Lineup Builder
"""
import streamlit as st
import pandas as pd
import numpy as np

st.set_page_config(
    page_title="Madden Classic DFS Optimizer",
    page_icon="🏈",
    layout="wide",
)

from madden.models import Player, Lineup, parse_players_csv
from madden.optimizer import optimize_lineup, generate_lineups
from madden.simulator import (
    run_simulation,
    SimulationResult,
    SINGLE_ENTRY_20,
    DOUBLE_UP_5,
    GPP_3,
    DEFAULT_STRUCTURES,
)
from madden.sample_data import SAMPLE_CSV
from madden.config import SALARY_CAP, ROSTER_SLOTS, POSITION_LIMITS

# ── Session State Initialization ──────────────────────────────────
if "players" not in st.session_state:
    st.session_state.players = []
if "lineups" not in st.session_state:
    st.session_state.lineups = []
if "sim_result" not in st.session_state:
    st.session_state.sim_result = None

# ── Sidebar ───────────────────────────────────────────────────────
st.sidebar.title("Madden Classic DFS")
page = st.sidebar.radio(
    "Navigation",
    ["Player Pool", "Lineup Optimizer", "Contest Simulator", "Export"],
)
st.sidebar.markdown("---")
st.sidebar.markdown(
    f"**Salary Cap:** ${SALARY_CAP:,}  \n"
    f"**Roster:** {len(ROSTER_SLOTS)} players  \n"
    f"**Slots:** QB, 2RB, 3WR, TE, FLEX, DST"
)

# ── Helper: load players ──────────────────────────────────────────
def load_players(csv_text: str):
    players = parse_players_csv(csv_text)
    st.session_state.players = players
    return players


# ══════════════════════════════════════════════════════════════════
#  PAGE: Player Pool
# ══════════════════════════════════════════════════════════════════
if page == "Player Pool":
    st.title("Player Pool")

    tab_upload, tab_sample = st.tabs(["Upload CSV", "Use Sample Data"])

    with tab_upload:
        st.markdown(
            "Upload a DraftKings CSV export or custom CSV with columns: "
            "**Name, Position, Team, Salary, AvgPointsPerGame** "
            "(optional: Ceiling, Floor, Ownership, StdDev)"
        )
        uploaded = st.file_uploader("Upload player CSV", type=["csv"])
        if uploaded:
            csv_text = uploaded.read().decode("utf-8")
            players = load_players(csv_text)
            st.success(f"Loaded {len(players)} players from upload.")

    with tab_sample:
        if st.button("Load Sample Madden Data"):
            players = load_players(SAMPLE_CSV)
            st.success(f"Loaded {len(players)} sample players.")

    if st.session_state.players:
        players = st.session_state.players
        df = pd.DataFrame([
            {
                "Name": p.name,
                "Pos": p.position,
                "Team": p.team,
                "Salary": p.salary,
                "Proj": round(p.projected_points, 1),
                "Ceil": round(p.ceiling, 1),
                "Floor": round(p.floor, 1),
                "Own%": round(p.ownership, 1),
                "Value": round(p.value, 2),
            }
            for p in players
        ])

        # Filters
        col1, col2, col3 = st.columns(3)
        with col1:
            pos_filter = st.multiselect("Position", ["QB", "RB", "WR", "TE", "DST"], default=["QB", "RB", "WR", "TE", "DST"])
        with col2:
            min_sal, max_sal = st.slider("Salary Range", 2000, 10000, (2000, 10000), step=100)
        with col3:
            sort_by = st.selectbox("Sort By", ["Proj", "Value", "Salary", "Ceil", "Own%"], index=0)

        filtered = df[df["Pos"].isin(pos_filter)]
        filtered = filtered[(filtered["Salary"] >= min_sal) & (filtered["Salary"] <= max_sal)]
        filtered = filtered.sort_values(sort_by, ascending=False)

        st.dataframe(filtered, use_container_width=True, hide_index=True)
        st.caption(f"Showing {len(filtered)} of {len(df)} players")

# ══════════════════════════════════════════════════════════════════
#  PAGE: Lineup Optimizer
# ══════════════════════════════════════════════════════════════════
elif page == "Lineup Optimizer":
    st.title("Lineup Optimizer")

    if not st.session_state.players:
        st.warning("Load players first from the Player Pool page.")
        st.stop()

    players = st.session_state.players

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Settings")
        num_lineups = st.slider("Number of lineups", 1, 150, 20)
        max_exposure = st.slider("Max player exposure %", 10, 100, 60) / 100
        randomness = st.slider("Randomness (diversity)", 0.0, 1.0, 0.3, 0.05)

    with col2:
        st.subheader("Lock / Exclude Players")
        player_names = [f"{p.name} ({p.position} - ${p.salary:,})" for p in players]
        locked_names = st.multiselect("Lock players (must include)", player_names)
        excluded_names = st.multiselect("Exclude players", player_names)

    locked = [players[player_names.index(n)] for n in locked_names]
    excluded = [players[player_names.index(n)] for n in excluded_names]

    if st.button("Optimize Lineups", type="primary"):
        with st.spinner(f"Generating {num_lineups} lineups..."):
            lineups = generate_lineups(
                players,
                count=num_lineups,
                locked=locked,
                excluded=excluded,
                max_exposure=max_exposure,
                randomness=randomness,
            )
            st.session_state.lineups = lineups

        st.success(f"Generated {len(lineups)} lineups!")

    if st.session_state.lineups:
        lineups = st.session_state.lineups

        # Summary stats
        st.markdown("### Lineup Summary")
        col1, col2, col3, col4 = st.columns(4)
        projs = [lu.total_projected for lu in lineups]
        sals = [lu.total_salary for lu in lineups]
        col1.metric("Avg Projection", f"{np.mean(projs):.1f}")
        col2.metric("Max Projection", f"{max(projs):.1f}")
        col3.metric("Avg Salary Used", f"${int(np.mean(sals)):,}")
        col4.metric("Lineups Generated", len(lineups))

        # Exposure table
        st.markdown("### Player Exposure")
        exposure = {}
        for lu in lineups:
            for p in lu.players:
                key = f"{p.name} ({p.position})"
                exposure[key] = exposure.get(key, 0) + 1
        exp_df = pd.DataFrame([
            {"Player": k, "Count": v, "Exposure%": round(v / len(lineups) * 100, 1)}
            for k, v in sorted(exposure.items(), key=lambda x: -x[1])
        ])
        st.dataframe(exp_df, use_container_width=True, hide_index=True)

        # Individual lineups
        st.markdown("### Individual Lineups")
        for i, lu in enumerate(lineups):
            with st.expander(f"Lineup {i+1} — Proj: {lu.total_projected:.1f} | Salary: ${lu.total_salary:,}"):
                lu_df = pd.DataFrame([
                    {"Pos": p.position, "Name": p.name, "Team": p.team,
                     "Salary": p.salary, "Proj": round(p.projected_points, 1)}
                    for p in lu.players
                ])
                st.dataframe(lu_df, use_container_width=True, hide_index=True)

# ══════════════════════════════════════════════════════════════════
#  PAGE: Contest Simulator
# ══════════════════════════════════════════════════════════════════
elif page == "Contest Simulator":
    st.title("Contest Simulator")

    if not st.session_state.lineups:
        st.warning("Generate lineups first from the Optimizer page.")
        st.stop()

    players = st.session_state.players
    lineups = st.session_state.lineups

    col1, col2 = st.columns(2)
    with col1:
        lineup_idx = st.selectbox(
            "Select lineup to simulate",
            range(len(lineups)),
            format_func=lambda i: f"Lineup {i+1} (Proj: {lineups[i].total_projected:.1f})",
        )
    with col2:
        contest_names = [s.name for s in DEFAULT_STRUCTURES]
        contest_idx = st.selectbox("Contest type", range(len(DEFAULT_STRUCTURES)),
                                    format_func=lambda i: DEFAULT_STRUCTURES[i].name)

    payout = DEFAULT_STRUCTURES[contest_idx]

    st.markdown(f"**Entry Fee:** ${payout.entry_fee:.2f} | "
                f"**Prize Pool:** ${payout.prize_pool:,.0f} | "
                f"**Entries:** {payout.total_entries:,}")

    col1, col2 = st.columns(2)
    with col1:
        n_sims = st.slider("Simulations", 100, 10000, 1000, step=100)
    with col2:
        n_opponents = st.slider("Opponents per sim", 50, 500, 100, step=50)

    selected_lineup = lineups[lineup_idx]

    # Show lineup
    st.markdown("#### Selected Lineup")
    lu_df = pd.DataFrame([
        {"Pos": p.position, "Name": p.name, "Team": p.team,
         "Salary": p.salary, "Proj": round(p.projected_points, 1)}
        for p in selected_lineup.players
    ])
    st.dataframe(lu_df, use_container_width=True, hide_index=True)

    if st.button("Run Simulation", type="primary"):
        with st.spinner(f"Running {n_sims} simulations..."):
            result = run_simulation(
                selected_lineup, players, payout,
                n_sims=n_sims, n_opponents=n_opponents,
            )
            st.session_state.sim_result = result

    if st.session_state.sim_result:
        result = st.session_state.sim_result

        st.markdown("### Simulation Results")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Avg Score", f"{result.avg_score:.1f}")
        c2.metric("Avg Rank", f"{result.avg_rank:.0f}")
        c3.metric("Avg Payout", f"${result.avg_payout:.2f}")
        c4.metric("ROI", f"{result.roi:.1f}%",
                   delta=f"{'+'if result.roi>0 else ''}{result.roi:.1f}%",
                   delta_color="normal")

        c1, c2, c3 = st.columns(3)
        c1.metric("Cash Rate", f"{result.cash_rate:.1f}%")
        c2.metric("Top 10 Rate", f"{result.top10_rate:.2f}%")
        c3.metric("1st Place Rate", f"{result.first_place_rate:.3f}%")

        # Score distribution chart
        st.markdown("### Score Distribution")
        score_df = pd.DataFrame({"Score": result.score_distribution})
        st.bar_chart(score_df["Score"].value_counts().sort_index())

        # Rank distribution chart
        st.markdown("### Rank Distribution")
        rank_df = pd.DataFrame({"Rank": result.rank_distribution})
        bins = [1, 10, 50, 100, 500, 1000, 5000, 10000]
        rank_df["Bucket"] = pd.cut(rank_df["Rank"], bins=bins, right=True)
        bucket_counts = rank_df["Bucket"].value_counts().sort_index()
        st.bar_chart(bucket_counts)

# ══════════════════════════════════════════════════════════════════
#  PAGE: Export
# ══════════════════════════════════════════════════════════════════
elif page == "Export":
    st.title("Export Lineups")

    if not st.session_state.lineups:
        st.warning("Generate lineups first from the Optimizer page.")
        st.stop()

    lineups = st.session_state.lineups
    st.info(f"{len(lineups)} lineups ready for export.")

    # DraftKings CSV format
    export_format = st.radio("Export Format", ["DraftKings CSV", "Summary CSV"])

    if export_format == "DraftKings CSV":
        st.markdown("Export in DraftKings bulk upload format.")
        rows = []
        for lu in lineups:
            row = {}
            slots = ["QB", "RB1", "RB2", "WR1", "WR2", "WR3", "TE", "FLEX", "DST"]
            rb_count = wr_count = 0
            flex_assigned = False
            for p in lu.players:
                if p.position == "QB":
                    row["QB"] = p.name
                elif p.position == "RB":
                    rb_count += 1
                    if rb_count <= 2:
                        row[f"RB{rb_count}"] = p.name
                    else:
                        row["FLEX"] = p.name
                        flex_assigned = True
                elif p.position == "WR":
                    wr_count += 1
                    if wr_count <= 3:
                        row[f"WR{wr_count}"] = p.name
                    else:
                        row["FLEX"] = p.name
                        flex_assigned = True
                elif p.position == "TE":
                    if "TE" not in row:
                        row["TE"] = p.name
                    else:
                        row["FLEX"] = p.name
                        flex_assigned = True
                elif p.position == "DST":
                    row["DST"] = p.name
            rows.append(row)

        dk_df = pd.DataFrame(rows, columns=["QB", "RB1", "RB2", "WR1", "WR2", "WR3", "TE", "FLEX", "DST"])
        st.dataframe(dk_df, use_container_width=True, hide_index=True)
        csv_data = dk_df.to_csv(index=False)
        st.download_button("Download DraftKings CSV", csv_data, "dk_lineups.csv", "text/csv")

    else:
        rows = []
        for i, lu in enumerate(lineups):
            for p in lu.players:
                rows.append({
                    "Lineup": i + 1,
                    "Position": p.position,
                    "Name": p.name,
                    "Team": p.team,
                    "Salary": p.salary,
                    "Projection": round(p.projected_points, 1),
                })
        summary_df = pd.DataFrame(rows)
        st.dataframe(summary_df, use_container_width=True, hide_index=True)
        csv_data = summary_df.to_csv(index=False)
        st.download_button("Download Summary CSV", csv_data, "lineup_summary.csv", "text/csv")
