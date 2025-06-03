import type { NodeData } from './types';

export const DefaultNode = ({ data }: { data: NodeData }) => (
  <div className="custom-node default-node">
    <strong>{data.label}</strong>
    <div>Type: {data.type}</div>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

export const AdNode = ({ data }: { data: NodeData }) => (
  <div className="custom-node ad-node" style={{ border: '2px solid #f90', background: '#fffbe6' }}>
    <strong>Ad: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

export const PostNode = ({ data }: { data: NodeData }) => (
  <div className="custom-node post-node" style={{ border: '2px solid #09f', background: '#e6f7ff' }}>
    <strong>Post: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);

export const CampaignNode = ({ data }: { data: NodeData }) => (
  <div className="custom-node campaign-node" style={{ border: '2px solid #0a0', background: '#e6ffe6' }}>
    <strong>Campaign: {data.label}</strong>
    <div>Channel: {data.channel}</div>
    <div>Budget: ${data.budget}</div>
  </div>
);