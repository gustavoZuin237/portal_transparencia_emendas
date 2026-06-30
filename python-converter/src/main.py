import json

from src.config import INPUT_FOLDER, OUTPUT_FOLDER
from src.converter import convert_file
from utils.logger import get_logger


def main():
    logger = get_logger()

    logger.info("Iniciando conversão")

    try:
        files = list(INPUT_FOLDER.glob("*.xlsx"))

        if not files:
            logger.warning("Nenhuma planilha encontrada")
            return

        all_emendas = []

        for file in files:
            logger.info(f"Processando o arquivo {file.name}")

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

        if len(output) > 0:
            logger.info(
                f"✅ Conversão concluída com sucesso: {len(output)} registros feitos"
            )
        else:
            logger.error(
                f"❌ Falha na conversão"
            )


    except Exception:
        logger.exception(
            f"❌ Falha na conversão"
        )


if __name__ == "__main__":
    main()