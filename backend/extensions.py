# backend/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restx import Api
from flask_cors import CORS

# Defina as instâncias aqui, sem associá-las à 'app' ainda
db = SQLAlchemy()
migrate = Migrate()
cors = CORS() # Definimos CORS aqui também para consistência
rest_api = Api(
    version='1.0',
    title='MidasPipe API',
    description='API para o sistema MidasPipe',
    doc='/api/docs'
    # Adicione outras configurações da API se necessário
)

# Não chame init_app() aqui! Isso será feito na factory.