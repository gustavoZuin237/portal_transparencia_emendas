import re

from src.models import Status

from datetime import datetime

import re

MM_YYYY_PATTERN = re.compile(r"^(0[1-9]|1[0-2])/\d{4}$")

EMENDA_PATTERN = re.compile(
    r"^\d{3}\.\d{1,2}$"
)

def validate_emenda(value: str) -> bool:
    return bool(
        EMENDA_PATTERN.match(value)
    )

def validate_date(value) -> str:    
    if not value:
        return ""

    if isinstance(value, datetime):
        return value.strftime("%m/%Y")

    value = str(value).strip()

    return value if MM_YYYY_PATTERN.fullmatch(value) else ""

def validate_status(value: str) -> bool:

    if not value:
        return False

    return value in [
        status.value
        for status in Status
    ]

def validate_required(value) -> bool:
    return (
        value is not None
        and str(value).strip() != ""
    )

def validate_row(row: dict) -> list[str]:
    """
    Returns a list of errors.
    Empty list means valid.
    """

    errors = []


    if not validate_required(
        row.get("Número")
    ):
        errors.append(
            "Número da emenda ausente"
        )


    if not validate_required(
        row.get("Parlamentar Autor")
    ):
        errors.append(
            "Parlamentar Autor ausente"
        )


    if not validate_status(
        row.get("Status")
    ):
        errors.append(
            "Status inválido"
        )
        
    if not validate_date(row.get("Data Estimada de Conclusão")):
        errors.append(
            "Data Estimada de Conclusão deve ser uma data válida"
        )

    return errors