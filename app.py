"""Streamlit host for the verified MWD Engineering Lab browser component."""
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
st.set_page_config(
    page_title="MWD Engineering Lab · Nabil Visi Samawi",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Local component assets preserve the original calculation engine and design.
# No external hosted page, API key, CDN, or database is required.
mwd_lab = components.declare_component("mwd_engineering_lab", path=str(ROOT / "dist"))
mwd_lab(key="mwd-lab", default=None)

st.download_button(
    "Download survey Excel template",
    data=(ROOT / "dist" / "MWD_Survey_Template.xlsx").read_bytes(),
    file_name="MWD_Survey_Template.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)
st.caption("Independent engineering study · synthetic examples · uncalibrated telemetry model")
