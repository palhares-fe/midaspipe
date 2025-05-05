# backend/api/test_ns.py

from flask_restx import Namespace, Resource
import datetime # Apenas para um exemplo dinâmico

# Cria um Namespace. O primeiro argumento é o nome lógico/URL parcial.
# 'description' aparece na documentação Swagger.
test_ns = Namespace('test', description='Endpoints de teste de integração Frontend-Backend')

# Define um Recurso (Resource) associado a uma rota dentro do Namespace.
# A rota '/hello' combinada com o path='/api/test' do namespace resulta em '/api/test/hello'
@test_ns.route('/hello')
class HelloWorldResource(Resource):
    # Define o método para requisições GET
    def get(self):
        """Retorna uma mensagem de teste simples.

        Esta descrição aparecerá na documentação do Swagger UI para este endpoint.
        """
        agora = datetime.datetime.now().isoformat()
        # Retorna um dicionário Python, Flask-RESTX o converterá para JSON.
        return {
            'message': 'Olá do Backend Flask-RESTX!',
            'status': 'conectado',
            'timestamp': agora
        }

# Você pode adicionar mais classes Resource e rotas a este namespace:
# @test_ns.route('/outro')
# class OutroResource(Resource):
#     def post(self):
#         # Lógica para POST
#         return {'received': 'ok'}, 201