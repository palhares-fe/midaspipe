export interface NodeData {
  label: string;
  type: string;
  channel: string;
  budget: number;
  description?: string;
}

export interface Journey {
  id: number;
  name: string;
  description: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewStepData {
  name: string;
  type: string;
  channel: string;
  budget: number;
  description?: string;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  type: 'node' | 'edge';
  onClose: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}