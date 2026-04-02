export interface AudioBlock {
  id: string;
  name: string;
  type: BlockType;
  icon: string;
  color: string;
  computeWeight: number;
}

export type BlockType =
  | 'input'
  | 'output'
  | 'gain'
  | 'eq'
  | 'compressor'
  | 'reverb'
  | 'delay'
  | 'distortion'
  | 'filter'
  | 'modulation';

export const TOTAL_SLOTS = 12;
export const SLOTS_PER_ROW = 6;
