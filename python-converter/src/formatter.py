import re

from datetime import datetime

def normalize_text(value: str) -> str:
    if not value:
        return ""

    return " ".join(
        str(value).strip().split()
    )

def format_name(value: str) -> str:
    value = normalize_text(value)

    return value.title()

def format_date(value) -> str:
    return "" if not value else str(value).strip()

def format_emenda(value) -> str:
    """
    Accept:
    168.10
    168-10
    168 10

    Return:
    168.10
    """

    if value is None:
        return ""

    value = str(value).strip()

    value = value.replace("-", ".")

    match = re.match(
        r"^(\d{3})\.(\d{1,2})$",
        value
    )

    if not match:
        return value

    return f"{match.group(1)}.{match.group(2)}"

def parse_money(value) -> float:
    """
    Accept:
    R$ 1.500,00
    1500
    1.500
    """

    if value is None or value == "":
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    value = (
        str(value)
        .replace("R$", "")
        .replace(" ", "")
        .strip()
    )

    value = value.replace(".", "")
    value = value.replace(",", ".")

    return float(value)

def format_money(value) -> str:
    """
    1500 -> R$ 1.500
    """

    value = parse_money(value)

    formatted = (
        f"{value:,.0f}"
        .replace(",", ".")
    )

    return f"R$ {formatted}"