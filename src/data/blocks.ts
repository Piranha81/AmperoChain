import { AudioBlock } from '../types/audio';

export const blockLibrary: AudioBlock[] = [
  {
    id: 'input-stereo',
    name: 'Stereo In',
    type: 'input',
    icon: '🔊',
    color: '#00ffff',
    computeWeight: 0,
  },
  {
    id: 'output-stereo',
    name: 'Stereo Out',
    type: 'output',
    icon: '🎧',
    color: '#ff00ff',
    computeWeight: 0,
  },
  {
    id: 'gain-mono',
    name: 'Gain',
    type: 'gain',
    icon: '📊',
    color: '#ffaa00',
    computeWeight: 1,
  },
  {
    id: 'eq-parametric',
    name: 'Parametric EQ',
    type: 'eq',
    icon: '📈',
    color: '#00ff88',
    computeWeight: 2,
  },
  {
    id: 'compressor-vca',
    name: 'Compressor',
    type: 'compressor',
    icon: '⚡',
    color: '#ff4444',
    computeWeight: 3,
  },
  {
    id: 'reverb-hall',
    name: 'Hall Reverb',
    type: 'reverb',
    icon: '🏛️',
    color: '#8844ff',
    computeWeight: 5,
  },
  {
    id: 'delay-stereo',
    name: 'Stereo Delay',
    type: 'delay',
    icon: '⏱️',
    color: '#44aaff',
    computeWeight: 4,
  },
  {
    id: 'distortion-tube',
    name: 'Tube Dist',
    type: 'distortion',
    icon: '🔥',
    color: '#ff6600',
    computeWeight: 3,
  },
  {
    id: 'filter-lp',
    name: 'Low Pass',
    type: 'filter',
    icon: '🔽',
    color: '#44ff88',
    computeWeight: 2,
  },
  {
    id: 'modulation-chorus',
    name: 'Chorus',
    type: 'modulation',
    icon: '〰️',
    color: '#ff88ff',
    computeWeight: 3,
  },
];

export function getBlockById(id: string): AudioBlock | undefined {
  return blockLibrary.find(b => b.id === id);
}
