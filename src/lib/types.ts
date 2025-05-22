
// Define the PuzzleDefinition type for our daily baseball puzzles
export interface PuzzleDefinition {
  id?: string;
  puzzle_date?: string;
  row1_label: string;
  row2_label: string;
  col1_label: string;
  col2_label: string;
  col3_label: string;
}

// Define a GridCell type for managing input state
export interface GridCell {
  value: string;
  isValid: boolean | null;
  isValidating: boolean;
  isLocked: boolean;
}

// Define the grid state as a 2D array of GridCells
export type GridState = GridCell[][];
