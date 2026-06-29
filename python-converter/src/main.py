import json

from src.config import INPUT_FOLDER, OUTPUT_FOLDER
from src.converter import convert_file
from utils.logger import get_logger


def main():
    logger = get_logger()

    logger.info("Starting conversion")

    try:
        files = list(INPUT_FOLDER.glob("*.xlsx"))

        if not files:
            logger.warning("No spreadsheet found")
            return

        all_emendas = []

        for file in files:
            logger.info(f"Processing {file.name}")

            emendas = convert_file(file)

            all_emendas.extend(emendas)


        output = [
            item.to_dict()
            for item in all_emendas
        ]


        with open(
            OUTPUT_FOLDER / "emendas.json",
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                output,
                f,
                ensure_ascii=False,
                indent=2
            )


        logger.info(
            f"Conversion finished successfully: {len(output)} records"
        )


    except Exception:
        logger.exception(
            "Conversion failed"
        )


if __name__ == "__main__":
    main()