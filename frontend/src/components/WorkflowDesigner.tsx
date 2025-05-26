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
} from 'reactflow';
import 'reactflow/dist/style.css';
import './WorkflowDesigner.css';
import type { NodeChange } from 'reactflow';

interface NodeData {
  label: string;
  type: string;
  channel: string;
  budget: number;
  description?: string;
}

// Componentes personalizados para cada tipo de node
const DefaultNode = ({ data }: {data: NodeData}) => (
  <div className="custom-node default-node">
    <strong>{data.label}</strong>
    <div>Type: {data.type}</div>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

const AdNode = ({ data }: {data: NodeData}) => (
  <div className="custom-node ad-node" style={{ border: '2px solid #f90', background: '#fffbe6' }}>
    <strong>Ad: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

const PostNode = ({ data }: {data: NodeData}) => (
  <div className="custom-node post-node" style={{ border: '2px solid #09f', background: '#e6f7ff' }}>
    <strong>Post: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

const CampaignNode = ({ data }: {data: NodeData}) => (
  <div className="custom-node campaign-node" style={{ border: '2px solid #0a0', background: '#e6ffe6' }}>
    <strong>Campaign: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

// Registro dos tipos de node
const nodeTypes = {
  default: DefaultNode,
  ad: AdNode,
  post: PostNode,
  campaign: CampaignNode,
};

interface Journey {
  id: number;
  nome: string;
  descricao: string;
  status: string;
}

interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

interface NewStepData {
  name: string;
  type: string;
  channel: string;
  budget: number;
  description: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  type: 'node' | 'edge';
}


const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onEdit, onDelete, type }) => {
  return (
    <div className="context-menu" style={{ left: x, top: y }}>
      {type === 'node' && onEdit && (
        <button onClick={onEdit}>Edit Step</button>
      )}
      <button onClick={onDelete}>Delete {type === 'node' ? 'Step' : 'Connection'}</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

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

  const fetchWorkflowData = useCallback(async () => {
    try {
      if (id === 'new') {
        setLoading(false);
        return;
      }

      // First, fetch the journey details
      const journeyResponse = await fetch(`http://localhost:5000/api/journeys/${id}`);
      if (!journeyResponse.ok) {
        throw new Error('Failed to fetch journey data');
      }
      const journeyData: Journey = await journeyResponse.json();
      console.log('Journey Response:', journeyData);
      setJourney(journeyData);

      // Then, fetch the workflow data (steps and connections)
      const workflowResponse = await fetch(`http://localhost:5000/api/journeys/${id}/workflow`);
      if (!workflowResponse.ok) {
        throw new Error('Failed to fetch workflow data');
      }
      const workflowData: WorkflowData = await workflowResponse.json();
      console.log('Workflow Response:', workflowData);

      setNodes(workflowData.nodes);
      console.log('edges:', workflowData.edges);
      setEdges(workflowData.edges);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchWorkflowData:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [id, setNodes, setEdges, setLoading, setError]);

  useEffect(() => {
    fetchWorkflowData();
  }, [fetchWorkflowData]);

  const onConnect = useCallback(
    async (params: Connection) => {
      try {
        if (!id || id === 'new') return;

        // First add the edge to the UI
        const newEdge = addEdge(params, edges);
        setEdges(newEdge);

        // Then save it to the database
        const response = await fetch(`http://localhost:5000/api/journeys/${id}/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_step_id: parseInt(params.source || '0'),
            target_step_id: parseInt(params.target || '0'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save connection');
        }

        const newConnection = await response.json();
        console.log('Connection saved:', newConnection);
      } catch (err) {
        console.error('Error saving connection:', err);
        setError(err instanceof Error ? err.message : 'Failed to save connection');
        // Remove the edge from the UI if saving failed
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

  const handleAddStep = async () => {
    try {
      if (!id || id === 'new') return;

      const response = await fetch(`http://localhost:5000/api/journeys/${id}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStepData.name,
          type: newStepData.type,
          channel: newStepData.channel,
          budget: newStepData.budget,
          description: newStepData.description,
          pos_x: 100, // Default position
          pos_y: 100, // Default position
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add step');
      }

      const newStep = await response.json();
      
      // Add the new node to the workflow
      const newNode: Node = {
        id: newStep.id.toString(),
        type: newStep.type,
        position: { x: newStep.pos_x, y: newStep.pos_y },
        data: {
          label: newStep.name,
          type: newStep.type,
          channel: newStep.channel,
          budget: newStep.budget,
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
      console.error('Error adding step:', err);
      setError(err instanceof Error ? err.message : 'Failed to add step');
    }
  };

  interface NodePositionUpdate {
    id: string;
    position: { x: number; y: number };
  }

  interface EdgeUpdate {
    source: string;
    target: string;
  }

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
  if (!unsavedChanges) return;

  const timeout = setTimeout(() => {
    handleSave();
  }, 60000); // 1 minuto

  return () => clearTimeout(timeout);
  }, [unsavedChanges, nodes, edges]);

  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      setUnsavedChanges(true);
    },
    [onNodesChange]
  );

  
  const handleSave = async () => {
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' 
        ? 'http://localhost:5000/api/journeys'
        : `http://localhost:5000/api/journeys/${id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: journey?.nome || 'New Journey',
          descricao: journey?.descricao || 'No description',
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

      if (!response.ok) {
        throw new Error('Failed to save journey');
      }

      setUnsavedChanges(false);
      
      const data = await response.json();
      if (id === 'new') {
        navigate(`/journey/${data.id}`);
      }
    } catch (err) {
      console.error('Error saving journey:', err);
      setError(err instanceof Error ? err.message : 'Failed to save journey');
    }
  };

  
  const handleDeleteNode = async (nodeId: string) => {
    try {
      if (!id || id === 'new') return;
      
      const response = await fetch(`http://localhost:5000/api/journeys/${id}/steps/${nodeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete step');
      }
      
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setContextMenu(null);
    } catch (err) {
      console.error('Error deleting step:', err);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_step_id: parseInt(edge.source),
          target_step_id: parseInt(edge.target),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete connection');
      }

      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setContextMenu(null);
    } catch (err) {
      console.error('Error deleting connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
    }
  };

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStepData.name,
          type: newStepData.type,
          channel: newStepData.channel,
          budget: newStepData.budget,
          description: newStepData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update step');
      }

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
      console.error('Error updating step:', err);
      setError(err instanceof Error ? err.message : 'Failed to update step');
    }
  };

  


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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedNode ? 'Edit Step' : 'Add New Step'}</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newStepData.name}
                onChange={(e) => setNewStepData({ ...newStepData, name: e.target.value })}
                placeholder="Enter step name"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={newStepData.type}
                onChange={(e) => setNewStepData({ ...newStepData, type: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="campaign">Campaign</option>
                <option value="ad">Ad</option>
                <option value="post">Social Media Post</option>
              </select>
            </div>
            <div className="form-group">
              <label>Channel</label>
              <select
                value={newStepData.channel}
                onChange={(e) => setNewStepData({ ...newStepData, channel: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
            <div className="form-group">
              <label>Budget</label>
              <input
                type="number"
                value={newStepData.budget}
                onChange={(e) => setNewStepData({ ...newStepData, budget: parseFloat(e.target.value) })}
                placeholder="Enter budget"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newStepData.description}
                onChange={(e) => setNewStepData({ ...newStepData, description: e.target.value })}
                placeholder="Enter step description"
              />
            </div>
            <div className="modal-actions">
              <button onClick={editingNodeId ? handleUpdateStep : handleAddStep}>Save Step</button>
              <button onClick={() => {
                setShowAddStepModal(false);
                setEditingNodeId(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDesigner; 