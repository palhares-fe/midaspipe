from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Carrega variáveis do arquivo backend/.env
load_dotenv()

# Inicializa o aplicativo Flask
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # React dev server
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Response helper functions
def success_response(data=None, message=None, status_code=200):
    response = {
        "status": "success",
        "data": data if data is not None else {},
    }
    if message:
        response["message"] = message
    return jsonify(response), status_code

def error_response(message, status_code=400, error_code=None):
    response = {
        "status": "error",
        "error": {
            "message": message
        }
    }
    if error_code:
        response["error"]["code"] = error_code
    return jsonify(response), status_code

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
    return success_response(
        data={"message": "Olá, Mundo Flask!"},
        message="API is running"
    )

# --- ROTA DE TESTE DE CONEXÃO ---
@app.route('/test-db')
def test_db_connection():
    try:
        # Tenta executar uma consulta SQL muito simples.
        db.session.execute(db.text('SELECT 1'))
        return success_response(
            data={"status": "connected"},
            message="Database connection successful!"
        )
    except Exception as e:
        return error_response(
            message=f"Database connection failed: {str(e)}",
            status_code=500,
            error_code="DB_CONNECTION_ERROR"
        )
# --- FIM DA ROTA DE TESTE ---


# --- CÓDIGO PARA RODAR A APP (se aplicável) ---
if __name__ == '__main__':
    # Lembre-se que 'flask run' é geralmente preferido e usa FLASK_APP/FLASK_DEBUG do .env
    app.run()