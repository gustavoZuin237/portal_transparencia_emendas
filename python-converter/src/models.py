from dataclasses import dataclass, asdict
from enum import Enum


class Status(Enum):
    ANALISE_TECNICA = "Análise Técnica"
    EM_PROCESSO = "Em processo"
    EMPENHADO = "Empenhado"
    LIQUIDADO = "Liquidado"
    PAGO = "Pago"
    CONCLUIDO = "Concluído"
    DEVOLVIDA = "Devolvida"


@dataclass
class Emenda:
    numeroEmenda: str
    parlamentarAutor: str
    beneficiario: str
    objeto: str

    valorPrevisto: str
    valorPrevistoNum: float

    valorEmpenhado: str
    valorEmpenhadoNum: float

    valorLiquidado: str
    valorLiquidadoNum: float

    valorPago: str
    valorPagoNum: float

    status: Status

    dataEstimadaConclusao: str
    planoTrabalho: bool
    notaFiscal: bool


    def to_dict(self):
        data = asdict(self)
        data["status"] = self.status.value
        return data