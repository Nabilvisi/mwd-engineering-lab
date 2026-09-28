# MWD Engineering Lab

An independent technical portfolio by **Nabil Visi Samawi**, with interactive directional survey calculations, BHA hydraulics and a mud-pulse telemetry sensitivity study.

## Run locally

Python 3.12 is recommended.

```bash
python -m pip install -r requirements.txt
streamlit run app.py
```

## Deploy to Streamlit Community Cloud

- Main file path: `app.py`
- Branch: `main`
- Python: `3.12`
- No secrets or external API services are required.

Create an app in Streamlit Community Cloud, select this GitHub repository, and deploy the entrypoint above. The app hosts all interface assets locally as a Streamlit custom component. It does not depend on the original ChatGPT-hosted Site.

## Projects

1. **Directional trajectory and survey calculation:** Minimum Curvature, tie-in coordinates, TVD, north/east displacement, DLS, metre/feet conversion, synthetic profiles, plan/section/3D projection, CSV export and formula-based Excel template.
2. **BHA hydraulics and mud-pulse telemetry:** smooth-pipe power-law/Newtonian pressure losses, parallel bit nozzle area, equivalent pulser restrictions, gas/liquid acoustic velocity and an explicitly hypothetical attenuation law.

The Method & Interview tab explains formulas, assumptions, references and a five-minute interview demonstration.

## Verification

```bash
node verify.mjs
python -m unittest discover -s tests
```

The engine has 50 analytical and boundary assertions, including vertical and circular paths, azimuth wraparound, SI/field conversion, invalid surveys, nozzle scaling, laminar pipe solutions and acoustic limits. Node.js is needed only for development verification, not to run or deploy the app. The browser executes the same verified JavaScript engine as the original dashboard.

The Excel workbook was checked against the engine and tested for invalid input and additional survey rows. Automated checks establish implementation consistency, not field validation.

## Model boundaries

- Inclination and azimuth are survey inputs; Minimum Curvature computes positions and interval DLS.
- No magnetic/grid correction, uncertainty analysis, sag correction or anti-collision model is included.
- Hydraulics estimates only the modeled internal losses, not total standpipe pressure or ECD. It excludes annulus, surface equipment, motors, tool joints and multiphase hydraulics.
- Transition flow is interpolated using a screening convention. Power-law mud has no yield stress; pipe roughness is omitted.
- Telemetry attenuation coefficients are hypothetical and editable. Uniform-pressure homogeneous acoustics do not resolve real bubble dynamics or wave reflections. No decoder or detection guarantee is modeled.
- All default datasets are synthetic. This is an independent study, not a Halliburton product or field operating program.

## Files

`app.py` hosts the application; `dist/engine.mjs` contains calculations; `dist/app.mjs` drives the interface; `dist/index.html` and `dist/style.css` define the design. `dist/streamlit-bridge.js` implements component readiness and automatic frame resizing. The spreadsheet is `dist/MWD_Survey_Template.xlsx`.

## References

- Sawaryn & Thorogood, SPE-84246-PA (2005): https://onepetro.org/DC/article-abstract/20/01/24/112554/A-Compendium-of-Directional-Calculations-Based-on
- Dodge–Metzner/generalized Reynolds discussion: https://www.mdpi.com/2311-5521/8/10/275
- SLB mud pulse telemetry glossary: https://glossary.slb.com/terms/m/mud_pulse_telemetry
- Aerated drilling telemetry study: https://www.sciencedirect.com/science/article/pii/S1876380412600391
- Continuous-wave telemetry research: https://www.nature.com/articles/s41598-025-08806-5
