import { useRef, useEffect } from 'react';
import { SLOTS_PER_ROW } from '../types/audio';
import { getBlockById } from '../data/blocks';
import { getColorForCategory, getIconForCategory } from '../data/icons';

interface ChainDisplayProps {
  onDrop: (source: number, target: number) => void;
  slots: (string | null)[];
  onSlotClick: (position: number) => void;
  onRemoveBlock: (position: number) => void;
  totalWeight: number;
}

export default function ChainDisplay({ slots, onSlotClick, onRemoveBlock, totalWeight, onDrop }: ChainDisplayProps) {
  const row1 = slots.slice(0, SLOTS_PER_ROW);
  const row2 = slots.slice(SLOTS_PER_ROW);

  return (
    <div className="chain-display">
      <div className="cpu-bar">
        <div className="cpu-bar-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }} />
        <span className="cpu-label">{totalWeight}% CPU</span>
      </div>

      <div className="chain-wrapper">
        <svg className="chain-svg" viewBox="240 0 700 264" preserveAspectRatio="xMidYMid meet">
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
            className="gold-line"
            fill="none"
          />
        </svg>

        <div className="chain-content">
          <div className="chain-row">
            <div className="hex-block hex-in">IN</div>
            {row1.map((slot, i) => (
              <SlotBlock key={i} slot={slot} position={i} onClick={onSlotClick} onRemove={onRemoveBlock} onDrop={onDrop} />
            ))}
          </div>
          <div className="chain-row">
{row2.map((slot, i) => (
            <SlotBlock key={i + SLOTS_PER_ROW} slot={slot} position={i + SLOTS_PER_ROW} onClick={onSlotClick} onRemove={onRemoveBlock} onDrop={onDrop} />
          ))}
            <div className="hex-block hex-out">OUT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotBlock({ slot, position, onClick, onRemove, onDrop }: {
  slot: string | null;
  position: number;
  onClick: (pos: number) => void;
    onRemove: (pos: number) => void;
    onDrop: (source: number, target: number) => void;
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

  // Mobile pointer‑drag support: store source slot while dragging
let dragSource: number | null = null;

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
draggable={!!slot}
        // Use pointer events for mobile compatibility
        onPointerDown={(e) => {
          if (e.button !== 0) return; // only primary button / touch
          dragSource = position;
          // make the element semi‑transparent while dragging
          (e.currentTarget as HTMLElement).style.opacity = '0.6';
        }}
        onPointerMove={(e) => {
          if (dragSource === null) return;
          e.preventDefault(); // prevent scrolling
        }}
        onPointerUp={(e) => {
          if (dragSource === null) return;
          const target = position;
          onDrop(dragSource, target);
          dragSource = null;
          (e.currentTarget as HTMLElement).style.opacity = '';
        }}
        onPointerCancel={(e) => {
          dragSource = null;
          (e.currentTarget as HTMLElement).style.opacity = '';
        }}
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
