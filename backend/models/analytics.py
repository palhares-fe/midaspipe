from datetime import datetime
from ..extensions import db
from sqlalchemy.sql import func

class Metric(db.Model):
    __tablename__ = 'metrics'
    id = db.Column(db.Integer, primary_key=True)
    step_id = db.Column(db.Integer, db.ForeignKey('steps.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # e.g., "CTR", "Conversion Rate"
    value = db.Column(db.Float, nullable=False)
    target = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(20), nullable=True)  # e.g., "%", "USD", "clicks"
    period = db.Column(db.String(20), nullable=False)  # e.g., "daily", "weekly", "monthly"
    date = db.Column(db.DateTime(timezone=True), nullable=False, default=func.now())
    source = db.Column(db.String(100), nullable=True)  # e.g., "Google Analytics", "Facebook Ads"
    
    step = db.relationship('Step', back_populates='metrics')
    categories = db.relationship('AnalyticsCategory', secondary='category_metrics', back_populates='metrics')

    def __repr__(self):
        return f'<Metric {self.name}: {self.value} {self.unit}>'

class AnalyticsCategory(db.Model):
    __tablename__ = 'analytics_categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Public Acquisition", "Performance"
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    
    metrics = db.relationship('Metric', secondary='category_metrics', back_populates='categories')

    def __repr__(self):
        return f'<AnalyticsCategory {self.name}>'

class CategoryMetric(db.Model):
    __tablename__ = 'category_metrics'
    category_id = db.Column(db.Integer, db.ForeignKey('analytics_categories.id'), primary_key=True)
    metric_id = db.Column(db.Integer, db.ForeignKey('metrics.id'), primary_key=True)

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    journey_id = db.Column(db.Integer, db.ForeignKey('journeys.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., "acquisition", "performance"
    period_start = db.Column(db.DateTime(timezone=True), nullable=False)
    period_end = db.Column(db.DateTime(timezone=True), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    
    journey = db.relationship('Journey', back_populates='reports')
    metrics = db.relationship('Metric', secondary='report_metrics')

    def __repr__(self):
        return f'<Report {self.name} ({self.type})>'

class ReportMetric(db.Model):
    __tablename__ = 'report_metrics'
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), primary_key=True)
    metric_id = db.Column(db.Integer, db.ForeignKey('metrics.id'), primary_key=True) 