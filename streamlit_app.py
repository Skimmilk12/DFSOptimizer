import streamlit as st
import os

st.set_page_config(
    page_title="Madden Classic Builder",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit UI chrome
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    .stApp > div:first-child { padding: 0; }
    .block-container { padding: 0 !important; max-width: 100% !important; }
    iframe { border: none !important; }
</style>
""", unsafe_allow_html=True)

dist_dir = os.path.join(os.path.dirname(__file__), "madden-classic", "dist")

# Read built assets
css_file = None
js_file = None
gen_worker = None
sim_worker = None

assets_dir = os.path.join(dist_dir, "assets")
if os.path.exists(assets_dir):
    for f in os.listdir(assets_dir):
        path = os.path.join(assets_dir, f)
        if f.startswith("index-") and f.endswith(".css"):
            with open(path) as fh:
                css_file = fh.read()
        elif f.startswith("index-") and f.endswith(".js"):
            with open(path) as fh:
                js_file = fh.read()
        elif f.startswith("generator.worker") and f.endswith(".js"):
            with open(path) as fh:
                gen_worker = fh.read()
        elif f.startswith("simulator.worker") and f.endswith(".js"):
            with open(path) as fh:
                sim_worker = fh.read()

if not js_file or not css_file:
    st.error("Build not found. Run `cd madden-classic && npm run build` first.")
    st.stop()

# Patch worker URLs in the JS bundle to use blob URLs instead of file paths
# The built JS references workers like: new Worker(new URL(`/assets/generator.worker-xxx.js`,...))
# We need to replace these with inline blob workers
import re

if gen_worker:
    gen_blob = f"URL.createObjectURL(new Blob([{repr(gen_worker)}],{{type:'text/javascript'}}))"
    js_file = re.sub(
        r'new\s+Worker\(new\s+URL\(`/assets/generator\.worker[^`]*`[^)]*\)\s*,\s*\{type:\s*`module`\}\)',
        f'new Worker({gen_blob})',
        js_file
    )

if sim_worker:
    sim_blob = f"URL.createObjectURL(new Blob([{repr(sim_worker)}],{{type:'text/javascript'}}))"
    js_file = re.sub(
        r'new\s+Worker\(new\s+URL\(`/assets/simulator\.worker[^`]*`[^)]*\)\s*,\s*\{type:\s*`module`\}\)',
        f'new Worker({sim_blob})',
        js_file
    )

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>{css_file}</style>
</head>
<body>
<div id="root"></div>
<script type="module">{js_file}</script>
</body>
</html>"""

st.components.v1.html(html, height=900, scrolling=True)
