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
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const dragSourcePos = useRef<number | null>(null);
  const wasDragging = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  useEffect(() => {
    const getSlotElementUnderPointer = (x: number, y: number): Element | null => {
      return document.elementFromPoint(x, y)?.closest('[data-slot-position]') ?? null;
    };

    const getSlotUnderPointer = (x: number, y: number): number | null => {
      const slotEl = getSlotElementUnderPointer(x, y);
      if (!slotEl) return null;
      const pos = slotEl.getAttribute('data-slot-position');
      return pos ? parseInt(pos, 10) : null;
    };

    const cleanupDrag = () => {
      isDragging.current = false;
      dragSourcePos.current = null;
      wrapperRef.current?.classList.remove('dragging');
      document.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
      setTimeout(() => { wasDragging.current = false; }, 100);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const target = getSlotUnderPointer(e.clientX, e.clientY);
      if (dragSourcePos.current !== null && target !== null) {
        onDrop(dragSourcePos.current, target);
      }
      cleanupDrag();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      document.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
      const slotEl = getSlotElementUnderPointer(e.clientX, e.clientY);
      if (slotEl) slotEl.classList.add('drag-hover');
    };

    const onCancel = () => {
      if (isDragging.current) {
        isDragging.current = false;
        cleanupDrag();
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [onDrop]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!slot) return;
    if (e.button !== 0) return;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      e.preventDefault();
      longPressTimer.current = setTimeout(() => {
        isDragging.current = true;
        dragSourcePos.current = position;
        wasDragging.current = true;
        wrapperRef.current?.classList.add('dragging');
        longPressTimer.current = null;
      }, 300);
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (wasDragging.current) return;
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
      data-slot-position={position}
      style={blockData ? { borderColor: color } : undefined}
      onContextMenu={e => e.preventDefault()}
      onDragStart={e => {
        if (!slot) return;
        e.dataTransfer.setData('text/plain', position.toString());
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const source = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(source)) onDrop(source, position);
      }}
      onDragEnd={() => {}}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={wrapperRef}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="mobile-drag-wrapper"
      >
        <div>
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


