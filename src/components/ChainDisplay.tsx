import { SLOTS_PER_ROW } from '../types/audio';
import { getBlockById } from '../data/blocks';

interface ChainDisplayProps {
  slots: (string | null)[];
  onSlotClick: (position: number) => void;
  onRemoveBlock: (position: number) => void;
  totalWeight: number;
}

export default function ChainDisplay({ slots, onSlotClick, onRemoveBlock, totalWeight }: ChainDisplayProps) {
  const row1 = slots.slice(0, SLOTS_PER_ROW);
  const row2 = slots.slice(SLOTS_PER_ROW);

  return (
    <div className="chain-display">
      <div className="cpu-bar">
        <div className="cpu-bar-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }} />
        <span className="cpu-label">{totalWeight}% CPU</span>
      </div>

      <div className="chain-wrapper">
        <svg className="chain-svg" viewBox="0 0 1200 264" preserveAspectRatio="xMidYMid meet">
          <path
            d="
              M 300 44
              H 914
              A 12 12 0 0 1 926 56
              V 106
              A 12 12 0 0 1 914 118
              H 320
              A 12 12 0 0 0 308 130
              V 182
              A 12 12 0 0 0 320 194
              H 950"
            className="gold-line" fill="none" />
        </svg>

        <div className="chain-content">
          <div className="chain-row">
            <div className="hex-block hex-in">IN</div>
            {row1.map((slot, i) => (
              <SlotBlock key={i} slot={slot} position={i} onClick={onSlotClick} onRemove={onRemoveBlock} />
            ))}
          </div>
          <div className="chain-row">
            {row2.map((slot, i) => (
              <SlotBlock key={i + SLOTS_PER_ROW} slot={slot} position={i + SLOTS_PER_ROW} onClick={onSlotClick} onRemove={onRemoveBlock} />
            ))}
            <div className="hex-block hex-out">OUT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotBlock({ slot, position, onClick, onRemove }: {
  slot: string | null;
  position: number;
  onClick: (pos: number) => void;
  onRemove: (pos: number) => void;
}) {
  const blockData = slot ? getBlockById(slot) : null;

  return (
    <div
      className={`slot ${slot ? 'filled' : 'empty'}`}
      onClick={() => !slot ? onClick(position) : undefined}
      onDoubleClick={() => slot ? onRemove(position) : undefined}
      style={blockData ? {
        borderColor: blockData.color,
        background: '#12121a',
        boxShadow: `0 0 10px ${blockData.color}33`,
      } : undefined}
    >
      {slot && blockData ? (
        <div className="block-node-content">
          <span className="block-icon">{blockData?.icon}</span>
          <span className="block-name">{blockData?.name}</span>
          <span className="block-weight">{blockData?.computeWeight}%</span>
        </div>
      ) : (
        <span className="plus-sign">+</span>
      )}
    </div>
  );
}
