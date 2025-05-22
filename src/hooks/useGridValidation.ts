
import { useCallback } from "react";
import { PuzzleDefinition } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { getTeamIdFromLabel, getDecadeFromLabel } from "@/lib/gridUtils";

export function useGridValidation(puzzle: PuzzleDefinition | null) {
  const validatePlayer = useCallback(async (
    playerName: string, 
    playerId: string | undefined,
    rowIndex: number, 
    colIndex: number
  ) => {
    if (!playerName.trim() || !puzzle) return false;
    
    // Get row label (team) and column label (decade)
    const rowLabel = rowIndex === 0 ? puzzle.row1_label : puzzle.row2_label;
    const colLabel = colIndex === 0 
      ? puzzle.col1_label 
      : colIndex === 1 
        ? puzzle.col2_label 
        : puzzle.col3_label;
    
    // Get team ID and decade
    const teamId = getTeamIdFromLabel(rowLabel);
    const decade = getDecadeFromLabel(colLabel);
    
    if (!teamId || !decade) {
      console.error("Invalid team or decade mapping", { rowLabel, colLabel, teamId, decade });
      return { isValid: false, reason: "Invalid puzzle configuration" };
    }
    
    try {
      // Call the check-answer Edge Function
      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          playerName,
          playerId,
          rowCategoryType: "team",
          rowCategoryValue: teamId,
          columnDecade: decade
        }
      });
      
      if (error) {
        console.error("Error calling check-answer function:", error);
        return { isValid: false, reason: "Error validating answer" };
      }
      
      return data;
    } catch (err) {
      console.error("Failed to validate player:", err);
      return { isValid: false, reason: "Validation service error" };
    }
  }, [puzzle]);

  return { validatePlayer };
}
