import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PuzzleDefinition } from "@/lib/types";
import { useGridState } from "@/hooks/useGridState";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";
import { getTeamIdFromLabel, getDecadeFromLabel } from "@/lib/gridUtils";
import LoadingDisplay from "@/components/grid/LoadingDisplay";
import ErrorDisplay from "@/components/grid/ErrorDisplay";
import GridContainer from "@/components/grid/GridContainer";

const GridPage = () => {
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const {
    gridState,
    updateCellValue,
    setCellValidation,
    setCellValidating,
    isGridComplete,
    areAllFilledCellsValid,
    resetGrid
  } = useGridState();
  
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        setLoading(true);
        
        // Fetch puzzle data for today's date
        const { data, error } = await supabase
          .from('puzzles')
          .select('*')
          .eq('puzzle_date', today)
          .single();
        
        if (error) {
          console.error("Error fetching puzzle:", error);
          setError("No puzzle available for today. Please check back later!");
          return;
        }
        
        setPuzzle(data);
      } catch (err) {
        console.error("Failed to fetch puzzle:", err);
        setError("An error occurred while loading the puzzle. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchPuzzle();
    }
  }, [today, authLoading, user]);

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
          playerId, // Pass the playerId if available for more precise validation
          rowCategoryType: "team", // For now, always "team"
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

  const handleCellUpdate = async (rowIndex: number, colIndex: number, value: string, playerId?: string) => {
    // Update the cell value and optionally the player ID if provided
    updateCellValue(rowIndex, colIndex, value, playerId);
    
    // We're not validating immediately on value change anymore
    // Validation will happen on form submission
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

  // Display loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <LoadingDisplay />
      </div>
    );
  }

  // If not authenticated, show the auth form
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <h1 className="font-heading text-4xl md:text-5xl text-navy mb-8">Double-Play Grid</h1>
        <div className="w-full max-w-md border-2 border-navy shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-cream rounded-2xl p-6">
          <AuthForm />
        </div>
      </div>
    );
  }

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

export default GridPage;
