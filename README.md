# Praverka (Gerador de Provas)

O Praverka é uma aplicação web desenvolvida em Python com Flask para a criação, gerenciamento e geração de avaliações escolares em formato PDF. O sistema permite criar provas com layout profissional, semelhante ao do ENEM, incluindo questões de múltipla escolha, discursivas e propostas de redação.

## Funcionalidades

- **Gerenciamento de Avaliações**: Painel para criar, editar, listar e excluir provas.
- **Editor de Questões**: Interface para adicionar e editar questões.
- **Personalização**: Configuração de cabeçalho, instruções, colunas e fontes.
- **Geração de PDF**: Exportação da prova formatada em PDF pronto para impressão.
- **Autenticação**: Sistema de login simples (padrão: admin/admin).
- **Armazenamento Local**: As avaliações são salvas localmente em arquivos JSON na pasta `data/assessments`.

## Pré-requisitos

- Python 3.8 ou superior.
- **GTK3 Runtime** (Necessário para o WeasyPrint no Windows). [Download aqui](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer)

## Instalação

1. Clone o repositório ou baixe os arquivos.
2. Abra o terminal na pasta do projeto.

3. Crie um ambiente virtual (recomendado):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

5. **Atenção (Windows)**: Para que a geração de PDF funcione corretamente, o WeasyPrint requer o GTK3 ([Download](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer)). Se você encontrar erros ao gerar o PDF, certifique-se de ter o GTK3 Runtime instalado e adicionado ao PATH do sistema.

## Como Usar

1. Inicie a aplicação:
   ```bash
   python app.py
   ```

2. Acesse no navegador:
   [http://127.0.0.1:5000](http://127.0.0.1:5000)

3. Faça login com as credenciais padrão:
   - **Usuário**: `admin`
   - **Senha**: `admin`

## Estrutura do Projeto

- `app.py`: Arquivo principal da aplicação Flask contendo a lógica do backend e rotas.
- `templates/`: Contém os templates HTML (Jinja2).
  - `pdf_template.html`: Modelo base para a geração do PDF.
  - `editor.html`: Interface de edição da prova.
  - `dashboard.html`: Painel principal.
- `static/`: Arquivos estáticos (CSS, JS).
- `data/assessments/`: Diretório onde os dados das provas são persistidos em JSON.
- `requirements.txt`: Lista de bibliotecas Python necessárias.

## Notas de Desenvolvimento

- A chave secreta da aplicação (`app.secret_key`) está definida no código para fins de desenvolvimento.
- O sistema utiliza `flask_bcrypt` para hash de senhas, mas o usuário admin é verificado de forma simplificada no código atual.
