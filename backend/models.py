# backend/models.py

from .extensions import db # Importa do extensions.py
from sqlalchemy.sql import func
import datetime

class User(db.Model): # Renomeado de Usuario
    __tablename__ = 'users' # Renomeado de usuarios
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relacionamento atualizado ('Journey', back_populates='creator')
    journeys = db.relationship('Journey', back_populates='creator', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.email}>'

class Journey(db.Model): # Renomeado de Jornada
    __tablename__ = 'journeys' # Renomeado de jornadas
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    modificated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())
    status = db.Column(db.String(50), nullable=False, default='Active') # Status em inglês

    # FK atualizada para 'users.id'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Relacionamento atualizado ('User', back_populates='journeys')
    # Nome do atributo pode ser 'creator' ou 'user'
    creator = db.relationship('User', back_populates='journeys')

    # Relacionamento atualizado ('Step', back_populates='journey')
    steps = db.relationship('Step', back_populates='journey', lazy=True, cascade="all, delete-orphan")

    # Add this to your existing relationships
    step_connections = db.relationship('StepConnection', back_populates='journey', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Journey {self.id}: {self.name}>'

class Step(db.Model): # Renomeado de Passo
    __tablename__ = 'steps' # Renomeado de passos
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # Ex: 'Performance Campaign', 'Brand Activation', 'Organic Post', 'Email Marketing', 'Event'
    type = db.Column(db.String(100), nullable=False, index=True)
    channel = db.Column(db.String(100), nullable=True) # Ex: 'Google Ads', 'Meta Ads', 'Instagram Feed', 'Blog', etc.
    budget = db.Column(db.Numeric(12, 2), nullable=True)
    date_start = db.Column(db.DateTime(timezone=True), nullable=True)
    date_end = db.Column(db.DateTime(timezone=True), nullable=True)
    # Ex: Planned, In Progress, Completed, Paused, Cancelled
    status = db.Column(db.String(50), nullable=False, default='Planned')
    pos_x = db.Column(db.Integer, default=0)
    pos_y = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    modificated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    # FK atualizada para 'journeys.id'
    journey_id = db.Column(db.Integer, db.ForeignKey('journeys.id'), nullable=False, index=True)

    # Relacionamento atualizado ('Journey', back_populates='steps')
    journey = db.relationship('Journey', back_populates='steps')

    # Relacionamento atualizado ('Cost', back_populates='step')
    costs = db.relationship('Cost', back_populates='step', lazy='dynamic', cascade="all, delete-orphan")

    # Add connections relationships
    outgoing_connections = db.relationship('StepConnection', foreign_keys='StepConnection.source_step_id', back_populates='source_step', cascade="all, delete-orphan")
    incoming_connections = db.relationship('StepConnection', foreign_keys='StepConnection.target_step_id', back_populates='target_step', cascade="all, delete-orphan")

    # Commenting out metrics relationship temporarily
    # metrics = db.relationship('Metric', back_populates='step', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Step {self.id}: {self.name} ({self.type})>'

class Cost(db.Model): # Renomeado de Custo
    __tablename__ = 'costs' # Renomeado de custos
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Numeric(12, 2), nullable=False)
    # Ex: 'Paid Media', 'Creative Production', 'Human Resources', 'SaaS Tool', 'Consulting', 'Other'
    cost_type = db.Column(db.String(50), nullable=False, index=True)
    occoured_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    timePeriod_start = db.Column(db.Date, nullable=True)
    timePeriod_end = db.Column(db.Date, nullable=True)

    # FK atualizada para 'steps.id'
    step_id = db.Column(db.Integer, db.ForeignKey('steps.id'), nullable=False, index=True)

    # Relacionamento atualizado ('Step', back_populates='costs')
    # Nome do atributo pode ser 'step' ou 'related_step'
    step = db.relationship('Step', back_populates='costs')

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    modificated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f'<Cost {self.id}: {self.cost_type} - {self.value}>'

class StepConnection(db.Model):
    __tablename__ = 'step_connections'
    id = db.Column(db.Integer, primary_key=True)
    source_step_id = db.Column(db.Integer, db.ForeignKey('steps.id'), nullable=False)
    target_step_id = db.Column(db.Integer, db.ForeignKey('steps.id'), nullable=False)
    journey_id = db.Column(db.Integer, db.ForeignKey('journeys.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source_step = db.relationship('Step', foreign_keys=[source_step_id], back_populates='outgoing_connections')
    target_step = db.relationship('Step', foreign_keys=[target_step_id], back_populates='incoming_connections')
    journey = db.relationship('Journey', back_populates='step_connections')

    def __repr__(self):
        return f'<StepConnection {self.source_step_id} -> {self.target_step_id}>'