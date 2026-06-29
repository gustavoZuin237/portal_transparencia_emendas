from openpyxl import load_workbook

from src.models import Emenda, Status, Secretaria
from src.formatter import (
    format_emenda,
    format_name,
    format_date,
    format_money,
    parse_money
)

from src.validator import (
    validate_row
)

from utils.logger import get_logger

logger = get_logger()

def convert_file(path):
    workbook = load_workbook(path)
    sheet = workbook.active

    headers = [
        cell.value
        for cell in sheet[1]
    ]

    result = []


    for row in sheet.iter_rows(min_row=2, values_only=True):
        data = dict(zip(headers, row))

        errors = validate_row(data)

        if errors:
            logger.warning(
                f"Linha ignorada: {errors}"
            )
            continue

        emenda = Emenda(
            numeroEmenda=format_emenda(data["Número"]),
            
            parlamentarAutor=format_name(data["Parlamentar Autor"]),
            
            secretaria=data["Secretaria"],

            beneficiario=data["Beneficiário"] or "",
            objeto=data["Objeto"] or "",
            
            tipo=data["Tipo"],

            valorPrevisto=format_money(
                data["Valor Previsto"]
            ),
            valorPrevistoNum=parse_money(
                data["Valor Previsto"]
            ),
            
            valorEmpenhado=format_money(
                data["Valor Empenhado"]
            ),
            valorEmpenhadoNum=parse_money(
                data["Valor Empenhado"]
            ),
            
            valorLiquidado=format_money(
                data["Valor Liquidado"]
            ),
            valorLiquidadoNum=parse_money(
                data["Valor Liquidado"]
            ),

            valorPago=format_money(
                data["Valor Pago"]
            ),
            valorPagoNum=parse_money(
                data["Valor Pago"]
            ),

            status=Status(data["Status"]),

            planoTrabalho=bool(
                data["Plano de Trabalho"]
            ),

            dataEstimadaConclusao=format_date(
                data["Data Estimada de Conclusão"]
            ),

            notaFiscal=bool(
                data["Nota Fiscal"]
            )
        )

        result.append(emenda)

    return result