
# midaspipe/check_cli.py
import os
import sys
import click
import traceback

# Tentativa de garantir que 'backend' seja encontrável se rodado da raiz
# Isso pode ou não ser necessário dependendo do seu PYTHONPATH
# sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("--- Iniciando check_cli.py ---")
# Definir FLASK_APP programaticamente PODE ajudar se não estiver no ambiente
# Mas idealmente o .env na raiz deve ser lido por load_dotenv em __init__
# os.environ['FLASK_APP'] = 'backend'
print(f"Verificando FLASK_APP no ambiente: {os.getenv('FLASK_APP')}")
print(f"Diretório atual: {os.getcwd()}")

try:
    # Importa a factory do pacote backend
    from backend import create_app
    print("Factory 'create_app' importada com sucesso.")

    # Cria a instância da aplicação
    # create_app() deve carregar .env (que está na raiz agora)
    app = create_app()
    print("Instância da App criada com sucesso.")

    # Verifica os comandos CLI registrados
    print("\nComandos CLI registrados:")
    # Acessa diretamente o objeto cli do Flask app
    if hasattr(app, 'cli') and isinstance(app.cli, click.Group):
         commands = list(app.cli.list_commands(None)) # Passar None como contexto é ok aqui
         print(commands)
         if 'db' in commands:
             print("\n✅ SUCESSO: O grupo de comando 'db' FOI registrado!")
         else:
             print("\n❌ FALHA: O grupo de comando 'db' NÃO foi encontrado nos comandos registrados.")
             print("   Isso geralmente significa que migrate.init_app(app, db) não foi chamado corretamente ou houve um erro antes disso.")
    else:
         print("Erro: Não foi possível acessar app.cli ou não é um click.Group.")


except ModuleNotFoundError as mnfe:
    print(f"\nERRO: ModuleNotFoundError durante o import ou criação da app: {mnfe}")
    print("Verifique se:")
    print("  1. Você está rodando este script da pasta raiz 'midaspipe/'.")
    print("  2. A estrutura 'backend/__init__.py' e 'backend/api/__init__.py' está correta.")
    print("  3. O ambiente virtual está ativo e tem todas as dependências.")
    traceback.print_exc()

except Exception as e:
    print(f"\nERRO inesperado durante a criação ou inspeção da app: {e}")
    traceback.print_exc()

print("\n--- Fim de check_cli.py ---")