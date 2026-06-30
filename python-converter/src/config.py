from pathlib import Path

ROOT = Path(__file__).parent.parent

CONVERTER_DOCS = ROOT / "docs"

FRONTEND_FOLDER = ROOT.parent / "web"
FRONTEND_DOCS_FOLDER = FRONTEND_FOLDER / "docs"

INPUT_FOLDER = ROOT / "input"
OUTPUT_FOLDER = ROOT.parent / "web/data"

LOG_FILE = OUTPUT_FOLDER / "converter.log"

DATE_FORMAT = "%d/%m/%Y"
LOCALE = "pt_BR"

SUPPORTED_EXTENSIONS = [
    ".xlsx",
    ".xls"
]