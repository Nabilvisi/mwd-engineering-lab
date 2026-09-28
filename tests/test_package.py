"""Deployment asset checks; numerical checks live in verify.mjs."""
import ast
import json
from pathlib import Path
import unittest
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]

class PackageTests(unittest.TestCase):
    def test_entrypoint_and_local_assets(self):
        ast.parse((ROOT / "app.py").read_text())
        html = (ROOT / "dist/index.html").read_text()
        for filename in ("style.css", "app.mjs", "streamlit-bridge.js"):
            self.assertIn(filename, html)
            self.assertTrue((ROOT / "dist" / filename).is_file())
        self.assertTrue((ROOT / "dist/engine.mjs").is_file())

    def test_verified_engine_and_workbook(self):
        result = json.loads((ROOT / "dist/verification.json").read_text())
        self.assertEqual(result["passed"], 50)
        with ZipFile(ROOT / "dist/MWD_Survey_Template.xlsx") as workbook:
            self.assertIn("xl/workbook.xml", workbook.namelist())

if __name__ == "__main__":
    unittest.main()
