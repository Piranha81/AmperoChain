export interface AudioBlock {
  id: string;
  name: string;
  type: string;
  computeWeight: number;
  category: string;
  subcategory: string;
  description: string;
}

export const TOTAL_SLOTS = 12;
export const SLOTS_PER_ROW = 6;
