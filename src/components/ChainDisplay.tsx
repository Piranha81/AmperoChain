import { useRef, useEffect } from 'react';
import { SLOTS_PER_ROW } from '../types/audio';
import { getBlockById } from '../data/blocks';
import { getColorForCategory, getIconForCategory } from '../data/icons';

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
  const color = blockData ? getColorForCategory(blockData.category) : undefined;
  const icon = blockData ? getIconForCategory(blockData.category) : undefined;
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      onClick(position);
      clickTimer.current = null;
    }, 250);
  };

  const handleDoubleClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    if (slot) onRemove(position);
  };

  return (
    <div
      className={`slot ${slot ? 'filled' : 'empty'}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={blockData ? {
        borderColor: color,
        boxShadow: `0 0 10px ${color}33`,
      } : undefined}
    >
      {slot && blockData ? (
        <div className="block-node-content">
          <span className="block-name" style={{ color }}>{blockData?.name}</span>
          {icon && <img className="block-icon-img" src={icon} alt="" />}
          <span className="block-weight">{blockData?.computeWeight}%</span>
        </div>
      ) : (
        <span className="plus-sign">+</span>
      )}
    </div>
  );
}
