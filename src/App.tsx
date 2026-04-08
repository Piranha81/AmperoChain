import { useState, useEffect, useCallback } from 'react';
import { getBlockById } from './data/blocks';
import ChainDisplay from './components/ChainDisplay';
import BlockPicker from './components/BlockPicker';
import PopupIntro from './components/PopupIntro';

const STORAGE_KEY = 'audio-chain-editor-state';

function createInitialSlots(): (string | null)[] {
  return Array(12).fill(null);
}

export default function App() {
  // Reset the chain on every page load by starting from a fresh initial state
  const [slots, setSlots] = useState<(string | null)[]>(() => createInitialSlots());

  // Ensure no persisted chain between page loads
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  // Show the introduction popup on every load (persisting state is unnecessary per requirements)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Intentionally avoid persisting chain state between page loads; resets on open.

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


  const handleDrop = useCallback((source: number, target: number) => {
    setSlots(prev => {
      const updated = [...prev];
      const moving = updated[source];
      // swap positions
      updated[source] = updated[target];
      updated[target] = moving;
      return updated;
    });
  }, []);

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

  const handleClearChain = useCallback(() => {
    setSlots(createInitialSlots());
  }, []);

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
      {showIntro && <PopupIntro onClose={() => setShowIntro(false)} />}
      <header className="header">
        <h1>Ampero II chain tool</h1>
        <div className="controls">
          <button className="btn btn-clear" onClick={handleClearChain}>Clear Chain</button>
          <button className="btn" onClick={handleExport}>Export</button>
          <button className="btn" onClick={handleImport}>Import</button>
          <div className="total-weight">Total CPU: {totalComputeWeight}%</div>
        </div>
      </header>
      
      <div className="main-layout">
        {pickerSlot !== null && (
          <div className={`sidebar-overlay ${pickerSlot !== null ? 'visible' : ''}`} onClick={() => setPickerSlot(null)} />
        )}
        <div className={`sidebar ${pickerSlot !== null ? 'open' : ''}`}>
          {pickerSlot !== null ? (
<BlockPicker
               position={pickerSlot}
               onSelect={handleSelectBlock}
               onClose={() => setPickerSlot(null)}
             />
          ) : null}
        </div>
        <div className="upper-half">
<ChainDisplay
              slots={slots}
              onSlotClick={handleSlotClick}
              onRemoveBlock={handleRemoveBlock}
              totalWeight={totalComputeWeight}
              onDrop={handleDrop}
            />
        </div>
      </div>
    </div>
  );
}
