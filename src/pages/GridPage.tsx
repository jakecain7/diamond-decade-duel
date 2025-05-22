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
    rowIndex: number, 
    colIndex: number,
    playerId?: string | null
  ) => {
    if (!playerName.trim() || !puzzle) return false;
    
    // Get row label (team) and column label (decade)
    const rowLabel = rowIndex === 0 ? puzzle.row1_label : puzzle.row2_label;
    const colLabel = colIndex === 0 
      ? puzzle.col1_label 
      : colIndex === 1 
        ? puzzle.col2_label 
        : colIndex === 3
          ? puzzle.col3_label
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
          rowCategoryType: "team", // For now, always "team"
          rowCategoryValue: teamId,
          columnDecade: decade,
          playerId
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

  const handleCellUpdate = async (rowIndex: number, colIndex: number, value: string) => {
    // Update the cell value immediately for responsiveness
    updateCellValue(rowIndex, colIndex, value);
  };

  const handleSuggestionSelect = async (rowIndex: number, colIndex: number, suggestion: any) => {
    console.log("Suggestion selected:", suggestion);
    
    // Update the cell with the suggested player name
    updateCellValue(rowIndex, colIndex, suggestion.name);
    
    // Validate the suggested player
    try {
      // Set the cell to validating state (shows spinner)
      setCellValidating(rowIndex, colIndex);
      
      // Use the player ID from the suggestion for more accurate validation
      const result = await validatePlayer(suggestion.name, rowIndex, colIndex, suggestion.id);
      
      if (result.isValid) {
        // Valid player - set the cell as valid and locked
        setCellValidation(
          rowIndex, 
          colIndex, 
          true, 
          true, // Lock the cell
          null, 
          result.playerId || suggestion.id
        );
        
        // Show success toast
        toast({
          title: "Correct!",
          description: `${result.playerFullName || suggestion.name} is a valid answer.`,
          variant: "default"
        });
      } else {
        // Invalid player - show error reason
        setCellValidation(
          rowIndex, 
          colIndex, 
          false, 
          false, // Don't lock the cell
          result.reason || "Invalid player",
          null
        );
        
        // Show feedback for invalid entries
        toast({
          title: "Invalid player",
          description: result.reason || "This player doesn't match the criteria. Try another name.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error validating suggested player:", err);
      setCellValidation(rowIndex, colIndex, false, false, "Error validating player");
    }
  };

  const handleCellBlur = async (rowIndex: number, colIndex: number) => {
    const cellValue = gridState[rowIndex][colIndex].value;
    
    // Skip validation if the cell is empty or already locked
    if (!cellValue.trim() || gridState[rowIndex][colIndex].isLocked) return;
    
    try {
      // Set the cell to validating state (shows spinner)
      setCellValidating(rowIndex, colIndex);
      
      // Validate the player name against the criteria
      const result = await validatePlayer(cellValue, rowIndex, colIndex);
      
      if (result.isValid) {
        // Valid player - set the cell as valid and locked
        setCellValidation(
          rowIndex, 
          colIndex, 
          true, 
          true, // Lock the cell
          null, 
          result.playerId || null
        );
        
        // Show success toast
        toast({
          title: "Correct!",
          description: `${result.playerFullName || cellValue} is a valid answer.`,
          variant: "default"
        });
      } else {
        // Invalid player - show error reason
        setCellValidation(
          rowIndex, 
          colIndex, 
          false, 
          false, // Don't lock the cell
          result.reason || "Invalid player",
          null
        );
        
        // Show feedback for invalid entries
        toast({
          title: "Invalid player",
          description: result.reason || "This player doesn't match the criteria. Try another name.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error validating player:", err);
      setCellValidation(rowIndex, colIndex, false, false, "Error validating player");
    }
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
    
    if (!areAllFilledCellsValid()) {
      toast({
        title: "Invalid entries",
        description: "Some of your entries are invalid. Please correct them before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save the results to the database
      // For now, we'll just simulate a success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "Your answers have been submitted.",
        variant: "default"
      });
      
      // Here you would typically show a results modal, calculate score, etc.
      
    } catch (err) {
      console.error("Error submitting answers:", err);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your answers. Please try again.",
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
        onSuggestionSelect={(rowIndex, colIndex, suggestion) => 
          handleSuggestionSelect(rowIndex, colIndex, suggestion)
        }
      />
    </div>
  );
};

export default GridPage;
