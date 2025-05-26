# backend/api/journey_ns.py (Arquivo renomeado)

from flask_restx import Namespace, Resource, fields
from ..extensions import db
from ..models import Journey, Step, StepConnection # Importa o modelo renomeado
from flask import request

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
        return [{'id': j.id, 'name': j.name, 'description': j.description, 'status': j.status, 'updated_at': j.modificated_at.isoformat() if j.modificated_at else None} for j in journeys]

    def post(self):
        """Cria uma nova Jornada."""
        data = journey_ns.payload
        name = dados.get('name')
        # ... (lógica como antes, mas usando o modelo Journey) ...
        usuario_id_atual = 1 # !! Lembre-se de implementar autenticação !!

        if not name:
             return {'message': 'Nome da jornada é obrigatório'}, 400

        new_journey = Journey( # Usa o modelo Journey
            name=name,
            description=data.get('descricao'),
            user_id=user_id
        )
        db.session.add(new_journey)
        db.session.commit()
        # ATUALIZAR retorno se necessário
        return {'id': new_journey.id, 'name': new_journey.name, 'status': new_journey.status}, 201

# Renomear parâmetro na rota e na função
@journey_ns.route('/<int:journey_id>')
class JourneyResource(Resource): # Nome da classe atualizado (opcional)
    def get(self, journey_id): # Parâmetro atualizado
        """Busca uma Jornada específica pelo ID."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ATUALIZAR retorno se necessário
        return {'id': journey.id, 'name': journey.name, 'description': journey.description, 'status': journey.status}

    def put(self, journey_id): # Parâmetro atualizado
        """Atualiza uma Jornada existente."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ... (lógica como antes, atualizando objeto journey) ...
        dados = journey_ns.payload
        journey.name = dados.get('name', journey.name)
        journey.description = dados.get('description', journey.description)
        journey.status = dados.get('status', journey.status)
        journey.modificated_at = db.func.current_timestamp() # Atualiza o timestamp
        db.session.commit()
        # ATUALIZAR retorno se necessário
        return {'id': journey.id, 'name': journey.name, 'status': journey.status}

    def delete(self, journey_id): # Parâmetro atualizado
        """Deleta uma Jornada."""
        journey = Journey.query.get_or_404(journey_id) # Usa o modelo Journey
        # ... (lógica como antes) ...
        db.session.delete(journey)
        db.session.commit()
        return '', 204 # Retorno vazio com status 204

@journey_ns.route('/<int:journey_id>/workflow')
class JourneyWorkflow(Resource):
    def get(self, journey_id):
        """Get the complete workflow data for a journey"""
        journey = Journey.query.get_or_404(journey_id)
        
        # Get all steps
        steps = Step.query.filter_by(journey_id=journey_id).all()
        
        # Get all connections
        connections = StepConnection.query.filter_by(journey_id=journey_id).all()
        
        return {
            'nodes': [{
                'id': str(step.id),
                'type': step.type,
                'position': {'x': step.pos_x, 'y': step.pos_y},
                'data': {
                    'label': step.name,
                    'type': step.type,
                    'budget': float(step.budget) if step.budget else None,
                    'status': step.status,
                    'description': step.description,
                    'channel': step.channel,
                    'date_start': step.date_start.isoformat() if step.date_start else None,
                    'date_end': step.date_end.isoformat() if step.date_end else None,
                }
            } for step in steps],
            'edges': [{
                'id': f'e{conn.id}',
                'source': str(conn.source_step_id),
                'target': str(conn.target_step_id),
                'type': 'smoothstep'
            } for conn in connections]
        }

    def post(self, journey_id):
        """Update the workflow layout"""
        journey = Journey.query.get_or_404(journey_id)
        data = request.json
        
        # Update node positions
        for node in data.get('nodes', []):
            step = Step.query.get(int(node['id']))
            if step and step.journey_id == journey_id:
                step.pos_x = node['position']['x']
                step.pos_y = node['position']['y']
        
        # Update connections
        # First, remove all existing connections
        StepConnection.query.filter_by(journey_id=journey_id).delete()
        
        # Then, add new connections
        for edge in data.get('edges', []):
            connection = StepConnection(
                source_step_id=int(edge['source']),
                target_step_id=int(edge['target']),
                journey_id=journey_id
            )
            db.session.add(connection)
        
        db.session.commit()
        return {'message': 'Workflow updated successfully'}

@journey_ns.route('/<int:journey_id>/steps')
class JourneySteps(Resource):
    def post(self, journey_id):
        """Add a new step to the journey"""
        journey = Journey.query.get_or_404(journey_id)
        data = request.json
        
        new_step = Step(
            name=data.get('name'),
            description=data.get('description'),
            type=data.get('type'),
            channel=data.get('channel'),
            budget=data.get('budget'),
            pos_x=data.get('pos_x', 0),
            pos_y=data.get('pos_y', 0),
            journey_id=journey_id
        )
        
        db.session.add(new_step)
        db.session.commit()
        
        return {
            'id': new_step.id,
            'name': new_step.name,
            'type': new_step.type,
            'channel': new_step.channel,
            'budget': float(new_step.budget) if new_step.budget else None,
            'pos_x': new_step.pos_x,
            'pos_y': new_step.pos_y
        }, 201

@journey_ns.route('/<int:journey_id>/connections')
class JourneyConnections(Resource):
    def post(self, journey_id):
        """Add a new connection between steps"""
        journey = Journey.query.get_or_404(journey_id)
        data = request.json
        
        # Validate that both steps exist and belong to this journey
        source_step = Step.query.filter_by(id=data.get('source_step_id'), journey_id=journey_id).first()
        target_step = Step.query.filter_by(id=data.get('target_step_id'), journey_id=journey_id).first()
        
        if not source_step or not target_step:
            return {'message': 'One or both steps not found or do not belong to this journey'}, 404
        
        # Check if connection already exists
        existing = StepConnection.query.filter_by(
            source_step_id=data.get('source_step_id'),
            target_step_id=data.get('target_step_id'),
            journey_id=journey_id
        ).first()
        
        if existing:
            return {'message': 'Connection already exists'}, 400
        
        new_connection = StepConnection(
            source_step_id=data.get('source_step_id'),
            target_step_id=data.get('target_step_id'),
            journey_id=journey_id
        )
        
        db.session.add(new_connection)
        db.session.commit()
        
        return {
            'id': new_connection.id,
            'source_step_id': new_connection.source_step_id,
            'target_step_id': new_connection.target_step_id
        }, 201

    def delete(self, journey_id):
        """Delete a connection between steps"""
        journey = Journey.query.get_or_404(journey_id)
        data = request.json
        
        # Find and delete the connection
        connection = StepConnection.query.filter_by(
            source_step_id=data.get('source_step_id'),
            target_step_id=data.get('target_step_id'),
            journey_id=journey_id
        ).first_or_404()
        
        db.session.delete(connection)
        db.session.commit()
        
        return '', 204

@journey_ns.route('/<int:journey_id>/steps/<int:step_id>')
class JourneyStep(Resource):
    def delete(self, journey_id, step_id):
        """Delete a step from the journey"""
        journey = Journey.query.get_or_404(journey_id)
        step = Step.query.filter_by(id=step_id, journey_id=journey_id).first_or_404()
        
        db.session.delete(step)
        db.session.commit()
        
        return '', 204