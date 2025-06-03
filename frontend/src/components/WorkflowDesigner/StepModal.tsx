import type { NewStepData } from './types';

const StepModal = ({
  isEditing,
  stepData,
  onChange,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  stepData: NewStepData;
  onChange: (data: NewStepData) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{isEditing ? 'Edit Step' : 'Add Step'}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
        >
          <label>
            Name:
            <input
              type="text"
              value={stepData.name}
              onChange={e => onChange({ ...stepData, name: e.target.value })}
              required
            />
          </label>
          <label>
            Type:
            <input
              type="text"
              value={stepData.type}
              onChange={e => onChange({ ...stepData, type: e.target.value })}
              required
            />
          </label>
          <label>
            Channel:
            <input
              type="text"
              value={stepData.channel}
              onChange={e => onChange({ ...stepData, channel: e.target.value })}
            />
          </label>
          <label>
            Budget:
            <input
              type="number"
              value={stepData.budget}
              onChange={e => onChange({ ...stepData, budget: Number(e.target.value) })}
              min={0}
            />
          </label>
          <label>
            Description:
            <textarea
              value={stepData.description}
              onChange={e => onChange({ ...stepData, description: e.target.value })}
            />
          </label>
          <div className="modal-actions">
            <button type="submit">{isEditing ? 'Save' : 'Add'}</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          background: #fff;
          border-radius: 8px;
          padding: 24px;
          min-width: 320px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        .modal-actions {
          margin-top: 16px;
          display: flex;
          gap: 8px;
        }
        label {
          display: block;
          margin-bottom: 10px;
        }
        input, textarea {
          width: 100%;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default StepModal;