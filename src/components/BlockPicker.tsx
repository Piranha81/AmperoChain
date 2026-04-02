import { blockLibrary } from '../data/blocks';

interface BlockPickerProps {
  position: number;
  slots: (string | null)[];
  onSelect: (blockId: string) => void;
  onClose: () => void;
}

export default function BlockPicker({ position, slots, onSelect, onClose }: BlockPickerProps) {
  const usedIds = new Set(slots.filter((s): s is string => s !== null));
  const availableBlocks = blockLibrary.filter(block => 
    !usedIds.has(block.id) && 
    block.type !== 'input' && 
    block.type !== 'output'
  );

  return (
    <div className="block-picker">
      <div className="picker-header">
        <span>Select module for slot {position + 1}</span>
        <button className="btn btn-close" onClick={onClose}>×</button>
      </div>
      <div className="picker-grid">
        {availableBlocks.map((block) => (
          <div
            key={block.id}
            className="picker-item"
            onClick={() => onSelect(block.id)}
            style={{ borderColor: block.color }}
          >
            <span className="picker-icon">{block.icon}</span>
            <span className="picker-name">{block.name}</span>
            <span className="picker-weight">{block.computeWeight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
