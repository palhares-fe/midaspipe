import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Journey {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/journeys');
      if (!response.ok) {
        throw new Error('Failed to fetch journeys');
      }
      const data = await response.json();
      setJourneys(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleCreateJourney = () => {
    navigate('/journey/new');
  };

  const handleJourneyClick = (journeyId: number) => {
    navigate(`/journey/${journeyId}`);
  };

  if (loading) return <div className="loading">Loading journeys...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Journeys</h1>
        <button className="create-button" onClick={handleCreateJourney}>
          Create New Journey
        </button>
      </header>

      <div className="journeys-grid">
        {journeys.map((journey) => (
          <div
            key={journey.id}
            className="journey-card"
            onClick={() => handleJourneyClick(journey.id)}
          >
            <h3>{journey.name}</h3>
            <p>{journey.description}</p>
            <div className="journey-meta">
              <span>Last updated: {new Date(journey.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 