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
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'updated_at'>('updated_at');

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
      console.log('Saída 01 - Fetched journeys:', data);
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

  const sortedJourneys = [...journeys].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'id') {
      return a.id - b.id;
    }
    // Ordena por data decrescente (mais recente primeiro)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Journeys</h1>
        <button className="create-button" onClick={handleCreateJourney}>
          Create New Journey
        </button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'id' | 'name' | 'updated_at')}>
          <option value="id">ID</option>
          <option value="updated_at">Last Updated</option>
          <option value="name">Name</option>
        </select>
      </header>

      <div className="journeys-grid">
        {sortedJourneys.map((journey) => (
          <div
            key={journey.id}
            className="journey-card"
            onClick={() => handleJourneyClick(journey.id)}
          >
            <p>ID: {journey.id}</p>
            <h3>{journey.name}</h3>
            <p>{journey.description}</p>
            <div className="journey-meta">
              <span>
                Last updated: {journey.updated_at && !isNaN(new Date(journey.updated_at).getTime())? new Date(journey.updated_at).toLocaleDateString(): 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 