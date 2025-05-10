import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

const WorkflowTest: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test journey ID - replace with your actual journey ID
  const journeyId = 4; // Updated to match our test journey

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/journeys/${journeyId}/workflow`);
        if (!response.ok) {
          throw new Error('Failed to load workflow');
        }
        const data = await response.json();
        setNodes(data.nodes);
        setEdges(data.edges);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading workflow:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [journeyId]);

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  if (loading) {
    return <div>Loading workflow...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowTest; 