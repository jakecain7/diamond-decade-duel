
export interface GridCell {
  value: string;
  isValid: boolean | null;
  isValidating: boolean;
  isLocked: boolean;
  errorReason?: string | null;
  playerId?: string | null;
}

export type GridState = GridCell[][];

export interface PuzzleDefinition {
  id: string;
  puzzle_date: string;
  row1_label: string;
  row2_label: string;
  col1_label: string;
  col2_label: string;
  col3_label: string;
}

export interface TeamMapping {
  [key: string]: string; // e.g., "New York Yankees": "NYA"
}

export interface PlayerSuggestion {
  id: string;
  name: string;
  fullInfo?: any;
  years?: string;
}
