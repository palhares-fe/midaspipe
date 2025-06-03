import type { Node } from 'reactflow';
import { DefaultNode, AdNode, PostNode, CampaignNode } from './CustomNodes';

export const nodeTypes = {
  default: DefaultNode,
  ad: AdNode,
  post: PostNode,
  campaign: CampaignNode,
} as const;

// Define interface for node types
export interface CustomNodeData {
  label: string;
  type: string;
  channel: string;
  budget: number;
}

export type CustomNode = Node<CustomNodeData>;
export type CustomNodeTypes = typeof nodeTypes;