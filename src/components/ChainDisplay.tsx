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

  // Refs for timers and drag state
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragSource = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  // Global cleanup for pointerup/cancel (covers drags that leave the slot)
  useEffect(() => {
    const endDrag = () => {
      dragSource.current = null;
      startPos.current = null;
      wrapperRef.current?.classList.remove('dragging');
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
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

const handlePointerDown = (e: React.PointerEvent) => {
          // Only prevent default for touch pointers to avoid canceling native mouse drag
          if (e.pointerType === 'touch') {
            e.preventDefault(); // stop native image drag / long‑press menu
          }
          if (e.button !== 0) return; // only primary button / touch
          dragSource.current = position;
          startPos.current = { x: e.clientX, y: e.clientY };
          wrapperRef.current?.classList.add('dragging');
        };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragSource.current === null) return;
    // Only prevent scrolling if the pointer has actually moved a bit
    const dx = e.clientX - (startPos.current?.x ?? 0);
    const dy = e.clientY - (startPos.current?.y ?? 0);
    if (Math.hypot(dx, dy) > 5) e.preventDefault();
  };

  const handlePointerUp = () => {
    if (dragSource.current === null) return;
    const target = position;
    onDrop(dragSource.current, target);
    dragSource.current = null;
    startPos.current = null;
    wrapperRef.current?.classList.remove('dragging');
  };

  return (
<div
          className={`slot ${slot ? 'filled' : 'empty'}`}
          draggable={!!slot} // desktop drag support
          style={blockData ? { borderColor: color } : undefined}
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => {
          if (!slot) return; // only drag filled slots
          e.dataTransfer.setData('text/plain', position.toString());
          // visual hint – make semi‑transparent
          (e.currentTarget as HTMLElement).style.opacity = '0.6';
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          const source = parseInt(e.dataTransfer.getData('text/plain'), 10);
          if (!isNaN(source)) onDrop(source, position);
        }}
        onDragEnd={e => {
          (e.currentTarget as HTMLElement).style.opacity = '';
        }}
      >
      {/* Mobile‑only wrapper handling pointer events */}
<div
          ref={wrapperRef}
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="mobile-drag-wrapper"
        >
        {/* Click / double‑click still work on the inner content */}
        <div onClick={handleClick} onDoubleClick={handleDoubleClick}>
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
      </div>
    </div>
  );
}


