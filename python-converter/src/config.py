from pathlib import Path

ROOT = Path(__file__).parent.parent

INPUT_FOLDER = ROOT / "input"
OUTPUT_FOLDER = ROOT / "output"

OUTPUT_JSON = OUTPUT_FOLDER / "data.json"
LOG_FILE = OUTPUT_FOLDER / "converter.log"

DATE_FORMAT = "%d/%m/%Y"
LOCALE = "pt_BR"

SUPPORTED_EXTENSIONS = [
    ".xlsx",
    ".xls"
]