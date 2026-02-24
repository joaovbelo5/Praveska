# Praveska

O **Praveska** é uma aplicação web desenvolvida em Python com o framework Flask, projetada para a criação, gerenciamento e geração automatizada de avaliações escolares em formato PDF. O sistema oferece um fluxo de trabalho completo para elaboração de provas com layout profissional, inspirado no modelo do ENEM, suportando questões de múltipla escolha, verdadeiro ou falso, discursivas e propostas de redação completas.

## Funcionalidades

O sistema foi arquitetado para atender às necessidades de docentes e instituições de ensino que necessitam de avaliações padronizadas e prontas para impressão:

*   **Gerenciamento de Avaliações**: Interface administrativa para criar, editar, listar e excluir provas, com persistência de dados em arquivos JSON locais.
*   **Editor de Questões**:
    *   **Múltipla Escolha**: Suporte a 5 alternativas (A-E) com inclusão de imagens nos enunciados e opções.
    *   **Verdadeiro ou Falso**: Geração automática de campos para marcação (C/E).
    *   **Discursivas**: Espaços pautados configuráveis para respostas escritas.
*   **Módulo de Redação**: Inclusão opcional de proposta de redação contendo textos motivadores, folha de rascunho pautada e folha definitiva com identificação do aluno.
*   **Geração de PDF (WeasyPrint)**: Renderização de documentos de alta fidelidade contendo:
    *   Capa com cabeçalho institucional (logo, nome da escola), dados do aluno e instruções de realização.
    *   Diagramação automática em colunas (configurável).
    *   Geração automática de **Cartão Resposta (Gabarito)** ao final do documento.
*   **Personalização**: Configuração de fontes, layout de colunas e instruções específicas por prova.
*   **Autenticação**: Sistema de login simplificado com hash de senhas via `flask_bcrypt`.

## Pré-requisitos Técnicos

*   **Python 3.8+**
*   **GTK3 Runtime** (Obrigatório para Windows): A biblioteca de geração de PDF `WeasyPrint` depende do GTK3 para renderização.
*   **Fontes do Sistema** (Linux/Servidores): É necessário garantir a presença de fontes compatíveis (como Microsoft Core Fonts ou Noto) para renderização correta de caracteres especiais e layouts.

## Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento ou execução local:

1.  **Clone o repositório e acesse o diretório:**
    ```bash
    git clone https://github.com/joaovbelo5/Praveska.git
    cd praveska
    ```

2.  **Crie e ative um ambiente virtual (recomendado):**
    *   Linux/macOS:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   Windows:
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```

3.  **Instale as dependências do projeto:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuração do Ambiente Windows (Crítico):**
    Baixe e instale o **GTK3 Runtime** ([Link Oficial](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer)). Certifique-se de reiniciar o terminal após a instalação para que as variáveis de ambiente (PATH) sejam atualizadas. Sem isso, a geração do PDF falhará com erro de `OSError` ou `dll missing`.

5.  **Configuração do Ambiente Linux (Ubuntu/Debian):**
    Instale as bibliotecas gráficas e fontes necessárias se estiver em um ambiente headless ou servidor:
    ```bash
    sudo apt-get install python3-pip python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0
    sudo apt-get install ttf-mscorefonts-installer fonts-noto
    ```

## Execução e Uso

1.  **Inicie o servidor de aplicação:**
    ```bash
    python app.py
    ```

2.  **Acesse a interface web:**
    Abra o navegador em [http://127.0.0.1:5000](http://127.0.0.1:5000).

3.  **Autenticação:**
    Utilize as credenciais padrão (configuradas para demonstração):
    *   **Usuário**: `admin`
    *   **Senha**: `admin`

### Fluxo de Trabalho
No painel principal (*Dashboard*), utilize a opção **"Nova Avaliação"** para iniciar. No editor, preencha os metadados (título, turma, data), adicione as questões desejadas e configure a proposta de redação se necessário. Após salvar, utilize o botão de geração de PDF para obter o arquivo final diagramado.

## Estrutura do Projeto

A organização dos arquivos segue o padrão MVC simplificado do Flask:

*   `app.py`: Ponto de entrada da aplicação, contendo rotas, lógica de controle e configurações do Flask.
*   `data/assessments/`: Diretório de persistência onde as avaliações são salvas em formato JSON.
*   `templates/`: Arquivos HTML (Jinja2).
    *   `pdf_template.html`: Template mestre para a renderização do PDF, contendo toda a estrutura visual da prova.
    *   `editor.html`: Interface de criação e edição de provas (SPA simplificada).
    *   `dashboard.html`: Listagem das avaliações.
*   `static/`: Arquivos CSS, JavaScript e imagens enviadas (uploads).
*   `requirements.txt`: Lista de dependências Python.

## Notas de Desenvolvimento

*   **Segurança**: A chave secreta (`app.secret_key`) está hardcoded no `app.py` para fins de desenvolvimento. Em produção, deve ser substituída por uma variável de ambiente.
*   **Persistência**: O sistema não utiliza banco de dados relacional; a integridade dos dados depende da estrutura do sistema de arquivos na pasta `data/`.
*   **Renderização**: A fidelidade visual do PDF depende das fontes instaladas no sistema operacional host. O template CSS (`static/css/pdf_style.css`) pode ser ajustado para modificar margens e espaçamentos.
