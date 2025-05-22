import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PuzzleDefinition } from "@/lib/types";
import { useGridState } from "@/hooks/useGridState";
import { useGridValidation } from "@/hooks/useGridValidation";
import LoadingDisplay from "@/components/grid/LoadingDisplay";
import ErrorDisplay from "@/components/grid/ErrorDisplay";
import GridContainer from "@/components/grid/GridContainer";

interface PuzzleContentProps {
  puzzle: PuzzleDefinition | null;
  loading: boolean;
  error: string | null;
}

const PuzzleContent = ({ puzzle, loading, error }: PuzzleContentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    gridState,
    updateCellValue,
    setCellValidation,
    setCellValidating,
    isGridComplete,
    areAllFilledCellsValid,
    resetGrid
  } = useGridState();
  
  const { validatePlayer } = useGridValidation(puzzle);

  const handleCellUpdate = async (rowIndex: number, colIndex: number, value: string, playerId?: string) => {
    // Update the cell value and optionally the player ID if provided
    updateCellValue(rowIndex, colIndex, value, playerId);
    // We're not validating immediately on value change anymore
  };

  // We're keeping this for future use, but not using it for validation on blur anymore
  const handleCellBlur = async (rowIndex: number, colIndex: number) => {
    // No longer triggering validation on blur
    // Left as placeholder for future functionality if needed
  };

  const handleSubmit = async () => {
    if (!isGridComplete()) {
      toast({
        title: "Incomplete grid",
        description: "Please fill all cells before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let allValid = true;
      
      // Validate each cell
      for (let rowIndex = 0; rowIndex < gridState.length; rowIndex++) {
        for (let colIndex = 0; colIndex < gridState[rowIndex].length; colIndex++) {
          const cell = gridState[rowIndex][colIndex];
          
          // Skip already validated and locked cells
          if (cell.isLocked && cell.isValid === true) continue;
          
          setCellValidating(rowIndex, colIndex);
          
          const result = await validatePlayer(
            cell.value, 
            cell.playerId, 
            rowIndex, 
            colIndex
          );
          
          if (result.isValid) {
            setCellValidation(
              rowIndex, 
              colIndex, 
              true, 
              true, // Lock the cell
              null, 
              result.playerId || cell.playerId
            );
          } else {
            setCellValidation(
              rowIndex, 
              colIndex, 
              false, 
              false, // Don't lock the cell
              result.reason || "Invalid player",
              cell.playerId
            );
            allValid = false;
          }
        }
      }
      
      if (allValid) {
        toast({
          title: "Success!",
          description: "All your answers are correct!",
          variant: "default"
        });
        // Here you would typically show a results modal, calculate score, etc.
      } else {
        toast({
          title: "Some entries are incorrect",
          description: "Please correct the highlighted entries and try again.",
          variant: "destructive"
        });
      }
      
    } catch (err) {
      console.error("Error submitting answers:", err);
      toast({
        title: "Submission error",
        description: "An error occurred while validating your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display loading state while grid is loading
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <LoadingDisplay message="Loading today's puzzle..." />
      </div>
    );
  }

  // Display error message if no puzzle is found
  if (error || !puzzle) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <h1 className="font-heading text-4xl md:text-5xl text-navy mb-8">Double-Play Grid</h1>
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream">
      <GridContainer 
        puzzle={puzzle}
        gridState={gridState}
        handleCellUpdate={handleCellUpdate}
        handleCellBlur={handleCellBlur}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isGridComplete={isGridComplete}
        areAllFilledCellsValid={areAllFilledCellsValid}
      />
    </div>
  );
};

export default PuzzleContent;
