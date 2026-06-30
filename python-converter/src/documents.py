import shutil

from src.config import CONVERTER_DOCS, FRONTEND_DOCS_FOLDER

def process_documents(emenda_id: str) -> list[str]:
    source_folder = CONVERTER_DOCS / f"EI_{emenda_id}"

    if not source_folder.exists():
        return []

    target_folder = FRONTEND_DOCS_FOLDER / emenda_id
    target_folder.mkdir(parents=True, exist_ok=True)

    documents = []

    for pdf in source_folder.glob("*.pdf"):
        target = target_folder / pdf.name

        shutil.copy2(pdf, target)

        documents.append(
            f"docs/{emenda_id}/{pdf.name}"
        )

    return documents