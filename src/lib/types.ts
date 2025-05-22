
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
