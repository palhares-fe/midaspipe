# backend/api/journey_ns.py (Arquivo renomeado)

from flask_restx import Namespace, Resource
from ..extensions import db
from ..models import Journey # Importa o modelo renomeado

# Renomeia o namespace
journey_ns = Namespace('journeys', description='Operações relacionadas a Jornadas (Journeys)')

# Modelos para marshalling (definir depois)
# journey_output_model = journey_ns.model('JourneyOutput', { ... })

@journey_ns.route('/') # Rota base é /api/journeys/ (definido no __init__.py)
class JourneyListResource(Resource): # Nome da classe atualizado (opcional)
    def get(self):
        """Lista todas as Jornadas."""
        journeys = Journey.query.all() # Usa o modelo Journey
        # ATUALIZAR a forma como os dados são retornados se necessário
        return [{'id': j.id, 'nome': j.name, 'descricao': j.description, 'status': j.status} for j in journeys]

    def post(self):
        """Cria uma nova Jornada."""
        dados = journey_ns.payload
        nome = dados.get('nome')
        # ... (lógica como antes, mas usando o modelo Journey) ...
        usuario_id_atual = 1 # !! Lembre-se de implementar autenticação !!

        if not nome:
             return {'message': 'Nome da jornada é obrigatório'}, 400

        new_journey = Journey( # Usa o modelo Journey
            name=nome,
            description=dados.get('descricao'),
            user_id=usuario_id_atual
        )
        db.session.add(new_journey)
        db.session.commit()
        # ATUALIZAR retorno se necessário
        return {'id': new_journey.id, 'nome': new_journey.name, 'status': new_journey.status}, 201

# Renomear parâmetro na rota e na função
@journey_ns.route('/<int:journey_id>')
class JourneyResource(Resource): # Nome da classe atualizado (opcional)
    def get(self, journey_id): # Parâmetro atualizado
        """Busca uma Jornada específica pelo ID."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ATUALIZAR retorno se necessário
        return {'id': journey.id, 'nome': journey.name, 'descricao': journey.description, 'status': journey.status}

    def put(self, journey_id): # Parâmetro atualizado
        """Atualiza uma Jornada existente."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ... (lógica como antes, atualizando objeto journey) ...
        dados = journey_ns.payload
        journey.name = dados.get('nome', journey.name)
        journey.description = dados.get('descricao', journey.description)
        journey.status = dados.get('status', journey.status)
        db.session.commit()
        # ATUALIZAR retorno se necessário
        return {'id': journey.id, 'nome': journey.name, 'status': journey.status}


    def delete(self, journey_id): # Parâmetro atualizado
        """Deleta uma Jornada."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ... (lógica como antes) ...
        db.session.delete(journey)
        db.session.commit()
        return '', 204 # Retorno vazio com status 204