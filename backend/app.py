from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Carrega variáveis do arquivo backend/.env
load_dotenv()

# Inicializa o aplicativo Flask
app = Flask(__name__)

# --- CONFIGURAÇÃO DO BANCO (ESSENCIAL) ---
database_url = os.getenv('DATABASE_URL')
if database_url is None:
    raise ValueError("Variável de ambiente DATABASE_URL não definida!")

# Corrige URL 'postgres://' para 'postgresql://' se necessário (Render usa postgres://)
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Desativa warnings

# Inicializa a extensão SQLAlchemy
db = SQLAlchemy(app)
# --- FIM DA CONFIGURAÇÃO DO BANCO ---


# --- SUAS ROTAS EXISTENTES ---
@app.route('/')
def hello_world():
    return '<h1>Olá, Mundo Flask!</h1>'

# --- ROTA DE TESTE DE CONEXÃO ---
@app.route('/test-db')
def test_db_connection():
    try:
        # Tenta executar uma consulta SQL muito simples.
        # Se a conexão falhar, isso levantará uma exceção.
        # db.text é usado para garantir que estamos enviando SQL literal seguro.
        db.session.execute(db.text('SELECT 1'))
        return '<h1>Conexão com o banco de dados bem-sucedida!</h1>'
    except Exception as e:
        # Captura qualquer exceção durante a tentativa de conexão/execução
        # e a exibe na página para depuração.
        return f'<h1>Falha ao conectar com o banco de dados: <pre>{e}</pre></h1>', 500
# --- FIM DA ROTA DE TESTE ---


# --- CÓDIGO PARA RODAR A APP (se aplicável) ---
if __name__ == '__main__':
    # Lembre-se que 'flask run' é geralmente preferido e usa FLASK_APP/FLASK_DEBUG do .env
    app.run()