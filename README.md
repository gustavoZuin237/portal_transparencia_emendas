# Documentação de Guia

**Nota:** É recomendado que o indivíduo interagindo com o repositório tenha conhecimentos básicos de programação e interação com terminal.


# Clonando o repositório

Na página do repositório chamado `portal_transparencia_emendas`no Github, acessível em [github.com/gustavoZuin237/portal_transparencia_emendas](https://github.com/gustavoZuin237/portal_transparencia_emendas), pressione um botão verde com o texto "Code", "Código" ou algo semelhante, selecione a opção "HTTPS" e copie o link apresentado.

Em seguida, abra uma nova janela de terminal em seu computador e copie o comando `git clone ...`, substituindo "..." pelo link obtido no Github. Esse comando vai gerar uma versão local do repositório do portal das emendas, permitindo operação e alterações locais sem afetar a versão remota do projeto.


# Instalando a aplicação

Após clonar o repositório, abra a pasta gerada com seu editor de código de preferência e siga os passos a seguir.

O diretório `python-converter` contém a aplicação criada em Python para converter planilhas em arquivos JSON para alimentar o portal das emendas. Essa aplicação necessita de algumas dependências, que devem ser instaladas com o comando `pip install -r requirements.txt` na raiz do diretório `python-converter`, assumindo que o sistema operacional do dispositivo utilizado já possua Python e Pip instalados (caso não tenha, verifique as referências oficiais abaixo).

**Baixando e Instalando Python: [www.python.org/downloads](https://www.python.org/downloads/)**

**Instalando Pip:** [pip.pypa.io/en/stable/installation](https://pip.pypa.io/en/stable/installation/)


# Convertendo planilhas

Para converter planilhas preenchidas por servidores públicos para JSON, crie uma pasta chamada `input` na raiz do diretório `python-converter`, caso a mesma não esteja presente, e copie os arquivos .xlsx para essa pasta.
Em seguida, rode o comando `python -m src.main`, ainda na raiz do diretório. Esse comando vai gerar duas pastas, `output` e `logs`, que contém o JSON criado com os dados da planilha inserida e registros do procedimento (erros, avisos, sucessos, etc), respectivamente.

A aplicação gera um único JSON com todos os dados de todas as planilhas inclusas no `input`.


# Atualizando o portal

Com o arquivo JSON criado, é possível ver uma prévia local de como o portal está simplesmente inserindo o arquivo JSON na pasta `input` do repositório `web`, rodando o comando `python -m http.server 8080`e accesando o link `http://localhost:8080` em seu navegador.

Para atualizar a versão de produção (versão publicamente acessível), entre em contato com os responsáveis pela atualização do portal e se informe sobre o fluxo de atualização.


# Manutenção da aplicação

Durante o processo de conversão de planilhas, registros automáticos são gerados na pasta `logs` do conversor em foma de arquivos `.log`. Esses registros são a ferramenta principal de manutenção da aplicação de conversão de planilhas.

Eles indicam a data e horário em que um determinado arquivo foi processado, o nome desse arquivo, avisos sobre linhas ignoradas (completas com o motivo pelo qual foram ignoradas), uma contagem dos registros feitos e mensagens de sucesso ou falhas. Linhas que tem algum campo problemático são ignoradas, porém o arquivo JSON ainda é gerado registrando as linhas da planilha que seguem os padrões esperados e os avisos nos registros indicam quais linhas de qual arquivo possuem erros.

Após localizar a linha que causou erros, analize os dados da linha e compare com o formato documentado nos comentários do arquivo `models.py` na pasta `python-converter/src`, que explicam qual é o modelo de campos que uma planilha obrigatoriamente deve seguir para ser válida no contexto da aplicação. Caso hajam erros no preenchimento da planilha, notifique o responsável pelo preenchimento e informe onde ocorreu o erro. Caso os dados pareçam estar preenchidos corretamente porém ainda apresentam falhas, entre em contato com o desenvolvedor responsável pela aplicação.