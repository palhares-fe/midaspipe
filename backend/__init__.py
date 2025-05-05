from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api # Importe Api do flask_restx
from flask_cors import CORS # <--- 1. Importe CORS
from dotenv import load_dotenv
from flask_migrate import Migrate # Para migrações de banco de dados
import os

# Importe os namespaces que vamos criar (passo seguinte)
from .api.test_ns import test_ns

load_dotenv()

# Inicialize as extensões fora da função create_app
db = SQLAlchemy()
api = Api(  # Crie a instância principal da API RESTX
    version='1.0',
    title='MidasPipe API',
    description='API para o sistema MidasPipe',
    doc='/api/docs'  # URL para a documentação interativa Swagger UI
    # prefix='/api' # Opcional: Adiciona /api a TODAS as rotas da API
                   # Se usar prefix aqui, ajuste o path no add_namespace abaixo
)
migrate = Migrate() # Pode inicializar aqui ou dentro da factory


def create_app():
    """Factory function para criar a instância da aplicação Flask."""
    app = Flask(__name__)

    # --- Configuração do Banco de Dados ---
    database_url = os.getenv('DATABASE_URL')
    if database_url is None:
        raise ValueError("Variável de ambiente DATABASE_URL não definida!")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Adicione outras configurações do Flask aqui, se necessário (ex: SECRET_KEY)
    # app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'uma-chave-secreta-default-para-dev')


    # --- Inicializar Extensões com a App ---
    db.init_app(app) # Associa SQLAlchemy com a app
    api.init_app(app) # Associa Flask-RESTX com a app
    CORS(app) # <--- 2. Inicialize CORS com a app (configuração básica para dev)
    # Alternativa mais segura para produção (especificando origem):
    # cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',') # Exemplo
    # CORS(app, resources={r"/api/*": {"origins": cors_origins}})
    
    migrate.init_app(app, db) # Inicializa Migrate aqui

    # --- IMPORTANTE: Importar modelos DEPOIS de inicializar db ---
    from . import models
    # --- FIM DA IMPORTAÇÃO ---

    # --- Registrar Namespaces da API ---
    # O 'path' define o prefixo da URL para todas as rotas DENTRO deste namespace
    # A rota '/hello' dentro de 'test_ns' se tornará '/api/test/hello'
    api.add_namespace(test_ns, path='/api/test')
    # Você adicionará outros namespaces (users_ns, projects_ns, etc.) aqui depois
    # api.add_namespace(users_ns, path='/api/users')

    # --- Rotas Flask Padrão (Opcional) ---
    # Mantenha apenas se fizer sentido ter rotas fora da API RESTX
    # Removi as rotas / e /test-db para focar na API RESTX
    # @app.route('/')
    # def basic_check():
    #     return "<h1>Backend MidasPipe - Acesse /api/docs</h1>"


    # --- Comandos CLI (Opcional) ---
    # Mantenha o comando test-db se ainda for útil
    @app.cli.command('test-db')
    def test_database_connection():
        """Verifica a conexão com o banco de dados."""
        try:
            with app.app_context(): # Garante contexto da aplicação para db.session
                 db.session.execute(db.text('SELECT 1'))
                 print('Conexão com o banco de dados bem-sucedida!')
        except Exception as e:
            print(f'Falha ao conectar com o banco de dados: {e}')

    return app

# Código para rodar com 'python app.py' (geralmente não necessário se usar 'flask run')
# if __name__ == '__main__':
#     app = create_app()
#     # FLASK_DEBUG=1 no .env deve ativar o modo debug
#     app.run()