import { useState } from 'react';
import { blockLibrary } from '../data/blocks';
import type { AudioBlock } from '../types/audio';

interface BlockPickerProps {
  position: number;
  slots: (string | null)[];
  onSelect: (blockId: string) => void;
  onClose: () => void;
}

interface CategoryGroup {
  category: string;
  color: string;
  icon: string;
  subcategories: { name: string; effects: AudioBlock[] }[];
}

export default function BlockPicker({ position, slots, onSelect, onClose }: BlockPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const usedIds = new Set(slots.filter((s): s is string => s !== null));

  const availableBlocks = blockLibrary.filter(block =>
    !usedIds.has(block.id) &&
    block.type !== 'input' &&
    block.type !== 'output'
  );

  const grouped: CategoryGroup[] = [];
  const categoryMap = new Map<string, CategoryGroup>();

  for (const block of availableBlocks) {
    if (!categoryMap.has(block.category)) {
      const cat: CategoryGroup = {
        category: block.category,
        color: block.color,
        icon: block.icon,
        subcategories: [],
      };
      categoryMap.set(block.category, cat);
      grouped.push(cat);
    }
    const cat = categoryMap.get(block.category)!;
    let sub = cat.subcategories.find(s => s.name === block.subcategory);
    if (!sub) {
      sub = { name: block.subcategory, effects: [] };
      cat.subcategories.push(sub);
    }
    sub.effects.push(block);
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategory(prev => prev === cat ? null : cat);
    setExpandedSub(null);
  };

  const toggleSub = (sub: string) => {
    setExpandedSub(prev => prev === sub ? null : sub);
  };

  const handleSelect = (blockId: string) => {
    onSelect(blockId);
    setExpandedCategory(null);
    setExpandedSub(null);
  };

  return (
    <div className="block-picker">
      <div className="picker-header">
        <span>Select effect for slot {position + 1}</span>
        <button className="btn btn-close" onClick={onClose}>×</button>
      </div>
      <div className="picker-content">
        {grouped.map(cat => (
          <div key={cat.category} className="category-section">
            <div
              className="category-header"
              style={{ borderColor: cat.color }}
              onClick={() => toggleCategory(cat.category)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.category}</span>
              <span className="category-count">{cat.subcategories.reduce((a, s) => a + s.effects.length, 0)}</span>
              <span className={`category-arrow ${expandedCategory === cat.category ? 'open' : ''}`}>▾</span>
            </div>
            {expandedCategory === cat.category && (
              <div className="subcategory-list">
                {cat.subcategories.map(sub => (
                  <div key={sub.name || 'none'} className="subcategory-section">
                    <div
                      className="subcategory-header"
                      onClick={() => sub.name ? toggleSub(sub.name) : undefined}
                      style={{ cursor: sub.name ? 'pointer' : 'default' }}
                    >
                      {sub.name && (
                        <>
                          <span className="subcategory-name">{sub.name}</span>
                          <span className="subcategory-count">{sub.effects.length}</span>
                          <span className={`subcategory-arrow ${expandedSub === sub.name ? 'open' : ''}`}>▾</span>
                        </>
                      )}
                    </div>
                    <div className={`effects-list ${!sub.name || expandedSub === sub.name ? 'visible' : ''}`}>
                      {sub.effects.map(effect => (
                        <div
                          key={effect.id}
                          className="effect-item"
                          style={{ borderLeftColor: effect.color }}
                          onClick={() => handleSelect(effect.id)}
                          title={effect.description}
                        >
                          <span className="effect-name">{effect.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
