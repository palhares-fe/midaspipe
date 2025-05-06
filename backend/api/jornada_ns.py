# backend/api/jornada_ns.py
from flask_restx import Namespace, Resource # Adicione fields para dados de entrada/saída depois
from ..extensions import db
from ..models import Jornada # Use '..' para subir um nível de backend/api para backend/

jornada_ns = Namespace('jornadas', description='Operações relacionadas a Jornadas')

# --- Modelos para marshalling (validação/serialização) - Adicionar depois para robustez ---
# jornada_input_model = jornada_ns.model('JornadaInput', { ... })
# jornada_output_model = jornada_ns.model('JornadaOutput', { ... })

@jornada_ns.route('/') # Rota para a lista de jornadas: /api/jornadas/
class JornadaListResource(Resource):
    # @jornada_ns.marshal_list_with(jornada_output_model) # Usar marshalling depois
    def get(self):
        """Lista todas as Jornadas."""
        jornadas = Jornada.query.all()
        # Converter para dicionário/json manualmente por enquanto
        # Idealmente, usar marshalling/schemas aqui
        return [{'id': j.id, 'nome': j.nome, 'descricao': j.descricao, 'status': j.status} for j in jornadas]

    # @jornada_ns.expect(jornada_input_model) # Usar marshalling/expect depois
    # @jornada_ns.marshal_with(jornada_output_model, code=201)
    def post(self):
        """Cria uma nova Jornada."""
        # Obter dados da requisição - Flask-RESTX facilita com reqparse ou expect
        dados = jornada_ns.payload # Pega o JSON enviado no corpo da requisição
        nome = dados.get('nome')
        descricao = dados.get('descricao')
        # ** TODO: Associar com o usuário logado! Por enquanto, hardcoded ou anônimo **
        usuario_id_atual = 1 # Exemplo - Substituir pela lógica de autenticação

        if not nome:
             return {'message': 'Nome da jornada é obrigatório'}, 400

        nova_jornada = Jornada(
            nome=nome,
            descricao=descricao,
            usuario_id=usuario_id_atual # Associar ao usuário
            # Status já tem default 'Ativa' no modelo
        )
        db.session.add(nova_jornada)
        db.session.commit()
        # Retornar o objeto criado (manualmente por enquanto)
        return {'id': nova_jornada.id, 'nome': nova_jornada.nome, 'descricao': nova_jornada.descricao, 'status': nova_jornada.status}, 201

@jornada_ns.route('/<int:jornada_id>') # Rota para uma jornada específica: /api/jornadas/<id>
class JornadaResource(Resource):
    # @jornada_ns.marshal_with(jornada_output_model)
    def get(self, jornada_id):
        """Busca uma Jornada específica pelo ID."""
        jornada = Jornada.query.get_or_404(jornada_id) # get_or_404 retorna 404 se não encontrar
        return {'id': jornada.id, 'nome': jornada.nome, 'descricao': jornada.descricao, 'status': jornada.status}

    # @jornada_ns.expect(jornada_input_model)
    # @jornada_ns.marshal_with(jornada_output_model)
    def put(self, jornada_id):
        """Atualiza uma Jornada existente."""
        jornada = Jornada.query.get_or_404(jornada_id)
        dados = jornada_ns.payload
        # ** TODO: Adicionar lógica de permissão - só o dono pode editar? **

        jornada.nome = dados.get('nome', jornada.nome) # Atualiza se fornecido
        jornada.descricao = dados.get('descricao', jornada.descricao)
        jornada.status = dados.get('status', jornada.status)
        # Adicionar atualização de outros campos conforme necessário

        db.session.commit()
        return {'id': jornada.id, 'nome': jornada.nome, 'descricao': jornada.descricao, 'status': jornada.status}

    def delete(self, jornada_id):
        """Deleta uma Jornada."""
        jornada = Jornada.query.get_or_404(jornada_id)
        # ** TODO: Adicionar lógica de permissão **

        db.session.delete(jornada)
        db.session.commit()
        return {'message': 'Jornada deletada com sucesso'}, 204 # 204 No Content é comum para DELETE