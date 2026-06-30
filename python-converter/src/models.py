from dataclasses import dataclass, asdict
from enum import Enum

class Tipo(Enum):
    "Entidades"
    "Execução Direta"

class Status(Enum):
    ANALISE_TECNICA = "Análise Técnica"
    EM_PROCESSO = "Em processo"
    EMPENHADO = "Empenhado"
    LIQUIDADO = "Liquidado"
    PAGO = "Pago"
    CONCLUIDO = "Concluído"
    DEVOLVIDA = "Devolvida"
    
class Secretaria(Enum):
    "Secretaria de Gabinete"
    "Secretaria de Governo e Relações Institucionais"
    "Procuradoria Geral de Município"
    "Secretaria de Desenvolvimento, Inovação e Turismo"
    "Secretaria de Desenvolvimento e Inclusão Social"
    "Secretaria de Habitação"
    "Secretaria de Meio Ambiente e do Bem Estar Animal"
    "Secretaria de Obras"
    "Secretaria de Educação"
    "Secretaria de Cultura e Economia Criativa"
    "Secretaria de Segurança Pública"
    "Secretaria de Planejamento Urbano"
    "Secretaria de Mobilidade Urbana"
    "Secretaria de Esportes, Lazer e Qualidade de Vida"
    "Secretaria de Administração"
    "Secretaria da Fazenda"
    "Secretaria da Saúde"
    "Secretaria de Serviços Públicos"
@dataclass
class Emenda:
    numeroEmenda: str # xxx.xx - 100.01
    parlamentarAutor: str #
    secretaria: str # Texto livre; Deve ser selecionada no preenchimento da planilha
    beneficiario: str # Texto livre
    objeto: str # Texto livre
    tipo: str # "Entidades" ou "Execução Direta"

    valorPrevisto: str # Valor em reais, formatado livremente
    valorPrevistoNum: float # Valor númerico cru guardado para uso interno da aplicação; Não aparece para o usuário ou consta na planilha

    valorEmpenhado: str # Valor em reais, formatado livremente
    valorEmpenhadoNum: float # Valor númerico cru guardado para uso interno da aplicação; Não aparece para o usuário ou consta na planilha

    valorLiquidado: str # Valor em reais, formatado livremente
    valorLiquidadoNum: float # Valor númerico cru guardado para uso interno da aplicação; Não aparece para o usuário ou consta na planilha

    valorPago: str # Valor em reais, formatado livremente
    valorPagoNum: float # Valor númerico cru guardado para uso interno da aplicação; Não aparece para o usuário ou consta na planilha

    status: Status # Deve ser um dos valores apresentados na classe Status acima

    dataEstimadaConclusao: str # xx/xxxx - 10/2022
    planoTrabalho: bool # "Sim" ou "Não"
    notaFiscal: bool # "Sim" ou "Não"


    def to_dict(self):
        data = asdict(self)
        data["status"] = self.status.value
        return data