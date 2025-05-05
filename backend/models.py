# backend/models.py

# Importa a instância 'db' do seu arquivo principal da aplicação Flask.
# Se 'db' está em 'backend/__init__.py', o import relativo '.' funciona.
from . import db
from sqlalchemy.sql import func
import datetime

# Modelo para Usuários
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=True) # Armazenará o hash da senha (implementar hash depois)
    data_criacao = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relacionamento: Um usuário pode ter várias jornadas
    # back_populates cria a referência bidirecional com Jornada.criador
    # lazy='dynamic' permite queries futuras no relacionamento (ex: filtrar jornadas)
    jornadas = db.relationship('Jornada', back_populates='criador', lazy='dynamic')

    def __repr__(self):
        return f'<Usuario {self.email}>'

# Modelo para Jornadas
class Jornada(db.Model):
    __tablename__ = 'jornadas'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False, index=True)
    descricao = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime(timezone=True), server_default=func.now())
    data_modificacao = db.Column(db.DateTime(timezone=True), onupdate=func.now())
    status = db.Column(db.String(50), nullable=False, default='Ativa') # Ex: Ativa, Arquivada, Rascunho

    # Chave Estrangeira: Qual usuário criou esta jornada?
    # Usamos 'usuarios.id' referenciando o __tablename__ da classe Usuario
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False, index=True)

    # Relacionamento: Aponta para o objeto Usuario criador
    criador = db.relationship('Usuario', back_populates='jornadas')

    # Relacionamento: Uma jornada tem muitos passos
    # cascade="all, delete-orphan" garante que se uma Jornada for deletada, seus Passos também serão.
    # lazy=True (padrão) carrega os passos apenas quando acessados.
    passos = db.relationship('Passo', back_populates='jornada', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Jornada {self.id}: {self.nome}>'

# Modelo para Passos
class Passo(db.Model):
    __tablename__ = 'passos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False) # Nome do passo/campanha/ativação
    descricao = db.Column(db.Text, nullable=True)
    # Tipo do Passo: Ex: 'Campanha Performance', 'Ativacao Marca', 'Post Organico', 'Email Marketing', 'Evento', 'Acao PR'
    tipo = db.Column(db.String(100), nullable=False, index=True)
    canal = db.Column(db.String(100), nullable=True) # Ex: 'Google Ads', 'Meta Ads', 'Instagram Feed', 'Blog', etc.
    orcamento = db.Column(db.Numeric(12, 2), nullable=True) # Orçamento específico (se aplicável ao tipo)
    data_inicio = db.Column(db.DateTime(timezone=True), nullable=True)
    data_fim = db.Column(db.DateTime(timezone=True), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Planejado') # Ex: Planejado, Em Andamento, Concluido, Pausado, Cancelado
    # Posição para UI de nós (se necessário armazenar no DB)
    pos_x = db.Column(db.Integer, default=0)
    pos_y = db.Column(db.Integer, default=0)
    # Metadados ou configurações específicas (JSON pode ser útil aqui se variar muito por tipo)
    # config_extra = db.Column(db.JSON, nullable=True)
    data_criacao = db.Column(db.DateTime(timezone=True), server_default=func.now())
    data_modificacao = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    # Chave Estrangeira: A qual jornada este passo pertence?
    # Usamos 'jornadas.id' referenciando o __tablename__ da classe Jornada
    jornada_id = db.Column(db.Integer, db.ForeignKey('jornadas.id'), nullable=False, index=True)

    # Relacionamento: Aponta para o objeto Jornada pai
    jornada = db.relationship('Jornada', back_populates='passos')

    # Relacionamento com Custo (Um passo pode ter vários custos)
    # lazy='dynamic' permite queries adicionais nos custos (ex: filtrar por tipo)
    custos = db.relationship('Custo', back_populates='passo', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Passo {self.id}: {self.nome} ({self.tipo})>'

# Modelo para Custos
class Custo(db.Model):
    __tablename__ = 'custos'
    id = db.Column(db.Integer, primary_key=True)
    # Descrição específica do custo (ex: "Google Ads Março", "Design Banners", "Reunião Kickoff")
    descricao = db.Column(db.String(255), nullable=False)
    # O valor monetário deste lançamento específico.
    valor = db.Column(db.Numeric(12, 2), nullable=False)
    # Categoria do custo. Permite agrupar e filtrar.
    # Exemplos: 'Mídia Paga', 'Produção Criativo', 'Recursos Humanos', 'Ferramentas SaaS', 'Consultoria', 'Outros'
    tipo_custo = db.Column(db.String(50), nullable=False, index=True)
    # Quando este custo foi efetivamente registrado ou pago. Usamos UTC como padrão.
    data_ocorrencia = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    # Opcional: Data de início do período ao qual este custo se refere (ex: 1º de Maio para custo de mídia de Maio)
    periodo_inicio = db.Column(db.Date, nullable=True)
    # Opcional: Data de fim do período ao qual este custo se refere (ex: 31 de Maio)
    periodo_fim = db.Column(db.Date, nullable=True)

    # Chave Estrangeira: A qual Passo este custo pertence?
    # Usamos 'passos.id' referenciando o __tablename__ da classe Passo
    passo_id = db.Column(db.Integer, db.ForeignKey('passos.id'), nullable=False, index=True)

    # Relacionamento: Aponta de volta para o objeto Passo
    passo = db.relationship('Passo', back_populates='custos')

    # Timestamps padrão para registro
    data_criacao = db.Column(db.DateTime(timezone=True), server_default=func.now())
    data_modificacao = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f'<Custo {self.id}: {self.tipo_custo} - {self.valor}>'