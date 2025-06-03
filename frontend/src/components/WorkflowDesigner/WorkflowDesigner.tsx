import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './WorkflowDesigner.css';
import { nodeTypes } from './nodeTypes';
import ContextMenu from './ContextMenu';
import StepModal from './StepModal';
import type { Journey, NewStepData } from './types';


const WorkflowDesigner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge';
    id: string;
  } | null>(null);
  const [newStepData, setNewStepData] = useState<NewStepData>({
    name: '',
    type: 'default',
    channel: 'default',
    budget: 0,
    description: '',
  });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);


  // Carrega workflow e journey
  const fetchWorkflowData = useCallback(async () => {
    try {
      if (id === 'new') {
        setLoading(false);
        return;
      }
      const journeyResponse = await fetch(`http://localhost:5000/api/journeys/${id}`);
      if (!journeyResponse.ok) throw new Error('Failed to fetch journey data');
      const journeyData: Journey = await journeyResponse.json();
      setJourney(journeyData);

      const workflowResponse = await fetch(`http://localhost:5000/api/journeys/${id}/workflow`);
      if (!workflowResponse.ok) throw new Error('Failed to fetch workflow data');
      const workflowData = await workflowResponse.json();
      setNodes(workflowData.nodes);
      setEdges(workflowData.edges);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [id, setNodes, setEdges]);

  useEffect(() => {
    fetchWorkflowData();
  }, [fetchWorkflowData]);

  // React Flow handlers
  const onConnect = useCallback(
    async (params: Connection) => {
      try {
        if (!id || id === 'new') return;
        const newEdge = addEdge(params, edges);
        setEdges(newEdge);
        const response = await fetch(`http://localhost:5000/api/journeys/${id}/connections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_step_id: parseInt(params.source || '0'),
            target_step_id: parseInt(params.target || '0'),
          }),
        });
        if (!response.ok) throw new Error('Failed to save connection');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save connection');
        setEdges((eds) => eds.filter((e) => e.source !== params.source || e.target !== params.target));
      }
    },
    [id, setEdges, edges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        id: node.id,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        id: edge.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
  }, []);

  // Step CRUD
  const handleAddStep = async () => {
    try {
      if (!id || id === 'new') return;
      const response = await fetch(`http://localhost:5000/api/journeys/${id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStepData.name,
          type: newStepData.type,
          channel: newStepData.channel,
          budget: newStepData.budget,
          description: newStepData.description,
          pos_x: 100,
          pos_y: 100,
        }),
      });
      if (!response.ok) throw new Error('Failed to add step');
      const newStep = await response.json();
      const newNode: Node = {
        id: newStep.id.toString(),
        type: newStep.type,
        position: { x: newStep.pos_x, y: newStep.pos_y },
        data: {
          label: newStep.name,
          type: newStep.type,
          channel: newStep.channel,
          budget: newStep.budget,
          description: newStep.description,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setShowAddStepModal(false);
      setNewStepData({
        name: '',
        type: 'default',
        channel: 'default',
        budget: 0,
        description: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add step');
    }
  };

  const handleEditNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNewStepData({
        name: node.data.label,
        type: node.data.type,
        channel: node.data.channel,
        budget: node.data.budget || 0,
        description: node.data.description || '',
      });
      setEditingNodeId(nodeId);
      setShowAddStepModal(true);
      setContextMenu(null);
    }
  };

  const handleUpdateStep = async () => {
    try {
      if (!id || id === 'new' || !editingNodeId) return;
      const response = await fetch(`http://localhost:5000/api/journeys/${id}/steps/${editingNodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStepData.name,
          type: newStepData.type,
          channel: newStepData.channel,
          budget: newStepData.budget,
          description: newStepData.description,
        }),
      });
      if (!response.ok) throw new Error('Failed to update step');
      const updatedStep = await response.json();
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNodeId
            ? {
                ...n,
                type: updatedStep.type,
                data: {
                  ...n.data,
                  label: updatedStep.name,
                  type: updatedStep.type,
                  channel: updatedStep.channel,
                  budget: updatedStep.budget,
                  description: updatedStep.description,
                },
              }
            : n
        )
      );
      setShowAddStepModal(false);
      setEditingNodeId(null);
      setNewStepData({
        name: '',
        type: 'default',
        channel: 'default',
        budget: 0,
        description: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      if (!id || id === 'new') return;
      const response = await fetch(`http://localhost:5000/api/journeys/${id}/steps/${nodeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete step');
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setContextMenu(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete step');
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    try {
      if (!id || id === 'new') return;
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;
      const response = await fetch(`http://localhost:5000/api/journeys/${id}/connections`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_step_id: parseInt(edge.source),
          target_step_id: parseInt(edge.target),
        }),
      });
      if (!response.ok) throw new Error('Failed to delete connection');
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setContextMenu(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
    }
  };

  const handleSave = useCallback(async () => {
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new'
        ? 'http://localhost:5000/api/journeys'
        : `http://localhost:5000/api/journeys/${id}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: journey?.name || 'New Journey',
          descricao: journey?.description || 'No description',
          steps: nodes.map(node => ({
            name: node.data.label,
            type: node.data.type,
            channel: node.data.channel,
            budget: node.data.budget,
            pos_x: node.position.x,
            pos_y: node.position.y,
          })),
          connections: edges.map(edge => ({
            source_step_id: parseInt(edge.source),
            target_step_id: parseInt(edge.target),
          })),
        }),
      });
      if (!response.ok) throw new Error('Failed to save journey');
      setUnsavedChanges(false);
      const data = await response.json();
      if (id === 'new') {
        navigate(`/journey/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save journey');
    }
  }, [id, journey, nodes, edges, navigate]);

  // Lazy save (timeout de 1 min)
  useEffect(() => {
    if (!unsavedChanges) return;
    const timeout = setTimeout(() => {
      handleSave();
    }, 60000);
    return () => clearTimeout(timeout);
  }, [unsavedChanges, nodes, edges, handleSave]);

  // Handle node changes
  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      setUnsavedChanges(true);
    },
    [onNodesChange]
  );



  // Render
  if (loading) return <div className="loading">Loading workflow...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="workflow-designer">
      <ReactFlow
        style={{ width: '100vw', height: '100vh' }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left" className="toolbar">
          <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          <button onClick={() => setShowAddStepModal(true)}>Add Step</button>
          <button onClick={handleSave}>Save Changes</button>
        </Panel>
        {selectedNode && (
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Step Details</h3>
            </div>
            <div className="step-details">
              <div className="detail-item">
                <label>Name</label>
                <span>{selectedNode.data.label}</span>
              </div>
              <div className="detail-item">
                <label>Type</label>
                <span>{selectedNode.data.type}</span>
              </div>
              <div className="detail-item">
                <label>Channel</label>
                <span>{selectedNode.data.channel}</span>
              </div>
              <div className="detail-item">
                <label>Budget</label>
                <span>${selectedNode.data.budget}</span>
              </div>
            </div>
          </div>
        )}
      </ReactFlow>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onEdit={contextMenu.type === 'node' ? () => handleEditNode(contextMenu.id) : undefined}
          onDelete={() => {
            if (contextMenu.type === 'node') {
              handleDeleteNode(contextMenu.id);
            } else {
              handleDeleteEdge(contextMenu.id);
            }
          }}
        />
      )}
      {showAddStepModal && (
        <StepModal
          isEditing={!!editingNodeId}
          stepData={newStepData}
          onChange={setNewStepData}
          onSave={editingNodeId ? handleUpdateStep : handleAddStep}
          onCancel={() => {
            setShowAddStepModal(false);
            setEditingNodeId(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkflowDesigner;