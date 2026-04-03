import { useState, useEffect, useCallback } from 'react';
import { getBlockById } from './data/blocks';
import ChainDisplay from './components/ChainDisplay';
import BlockPicker from './components/BlockPicker';

const STORAGE_KEY = 'audio-chain-editor-state';

function createInitialSlots(): (string | null)[] {
  return Array(12).fill(null);
}

export default function App() {
  const [slots, setSlots] = useState<(string | null)[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 12) return parsed;
      }
    } catch (e) {}
    return createInitialSlots();
  });

  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  const handleSlotClick = useCallback((position: number) => {
    setPickerSlot(position);
  }, []);

  const handleSelectBlock = useCallback((blockId: string) => {
    if (pickerSlot === null) return;
    setSlots(prev => {
      const updated = [...prev];
      updated[pickerSlot] = blockId;
      return updated;
    });
    setPickerSlot(null);
  }, [pickerSlot]);

  const handleRemoveBlock = useCallback((position: number) => {
    setSlots(prev => {
      const updated = [...prev];
      updated[position] = null;
      return updated;
    });
  }, []);

  const totalComputeWeight = slots.reduce((sum, slot) => {
    if (slot) {
      const block = getBlockById(slot);
      return sum + (block?.computeWeight || 0);
    }
    return sum;
  }, 0);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(slots, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio-chain.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [slots]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            if (Array.isArray(imported) && imported.length === 12) {
              setSlots(imported);
            }
          } catch (err) {
            alert('Invalid file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Audio Chain Editor</h1>
        <div className="controls">
          <button className="btn" onClick={handleExport}>Export</button>
          <button className="btn" onClick={handleImport}>Import</button>
          <div className="total-weight">Total CPU: {totalComputeWeight}%</div>
        </div>
      </header>
      
      <div className="upper-half">
        <ChainDisplay
          slots={slots}
          onSlotClick={handleSlotClick}
          onRemoveBlock={handleRemoveBlock}
          totalWeight={totalComputeWeight}
        />
      </div>
      
      <div className="lower-half">
        {pickerSlot !== null ? (
          <BlockPicker
            position={pickerSlot}
            slots={slots}
            onSelect={handleSelectBlock}
            onClose={() => setPickerSlot(null)}
          />
        ) : (
          <div className="picker-placeholder">Click a "+" slot to add a module</div>
        )}
      </div>
    </div>
  );
}
