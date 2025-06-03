import React from 'react';
import type { ContextMenuProps } from './types';

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: 120,
        padding: 0,
      }}
      onMouseLeave={onClose}
    >
      {type === 'node' && onEdit && (
        <button className="context-menu-item" onClick={onEdit}>
          Edit Node
        </button>
      )}
      <button className="context-menu-item" onClick={onDelete}>
        Delete {type === 'node' ? 'Node' : 'Edge'}
      </button>
    </div>
  );
};

export default ContextMenu;