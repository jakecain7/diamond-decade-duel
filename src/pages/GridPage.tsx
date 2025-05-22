
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import GridCell from "@/components/GridCell";
import { supabase } from "@/integrations/supabase/client";
import { PuzzleDefinition, TeamMapping } from "@/lib/types";
import { useGridState } from "@/hooks/useGridState";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";
import { Loader2 } from "lucide-react";

// Mapping of team names to team IDs (would ideally come from database)
const TEAM_MAPPINGS: TeamMapping = {
  "New York Yankees": "NYA",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHN",
  "Los Angeles Dodgers": "LAN",
  // Add more mappings as needed for your puzzles
};

// Mapping of decade labels to decade start years
const DECADE_MAPPINGS: { [key: string]: number } = {
  "1970s": 1970,
  "1980s": 1980,
  "1990s": 1990,
  // Add more mappings as needed
};

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

  // Get team ID from row label
  const getTeamIdFromLabel = (label: string): string => {
    return TEAM_MAPPINGS[label] || "";
  };

  // Get decade start year from column label
  const getDecadeFromLabel = (label: string): number => {
    return DECADE_MAPPINGS[label] || 0;
  };

  const validatePlayer = useCallback(async (
    playerName: string, 
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

  const handleCellUpdate = async (rowIndex: number, colIndex: number, value: string) => {
    // Update the cell value immediately for responsiveness
    updateCellValue(rowIndex, colIndex, value);
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
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#1d3557]" />
          <p className="text-xl text-[#1d3557]">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show the auth form
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 border-[#1d3557] shadow-lg">
          <CardContent className="p-6">
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display loading state while grid is loading
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <p className="text-xl text-[#1d3557]">Loading today's puzzle...</p>
      </div>
    );
  }

  // Display error message if no puzzle is found
  if (error || !puzzle) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d3557] mb-8 font-serif italic">Double-Play Grid</h1>
        <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg p-8 text-center">
          <p className="text-xl text-[#e76f51]">{error || "No puzzle available for today. Please check back later!"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1d3557] mb-8 font-serif italic">Double-Play Grid</h1>
      
      <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg">
        <CardContent className="p-6">
          {/* Grid header with decade labels */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
            <div className=""></div> {/* Empty cell for top-left corner */}
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              {puzzle.col1_label}
            </div>
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              {puzzle.col2_label}
            </div>
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              {puzzle.col3_label}
            </div>
          </div>

          {/* First row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
            <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
              <span className="text-[#1d3557] text-center">{puzzle.row1_label}</span>
            </div>
            {gridState[0].map((cell, colIndex) => (
              <GridCell
                key={`0-${colIndex}`}
                cell={cell}
                rowIndex={0}
                colIndex={colIndex}
                onValueChange={(value) => handleCellUpdate(0, colIndex, value)}
                onBlur={() => handleCellBlur(0, colIndex)}
              />
            ))}
          </div>

          {/* Second row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2">
            <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
              <span className="text-[#1d3557] text-center">{puzzle.row2_label}</span>
            </div>
            {gridState[1].map((cell, colIndex) => (
              <GridCell
                key={`1-${colIndex}`}
                cell={cell}
                rowIndex={1}
                colIndex={colIndex}
                onValueChange={(value) => handleCellUpdate(1, colIndex, value)}
                onBlur={() => handleCellBlur(1, colIndex)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isGridComplete() || !areAllFilledCellsValid()}
          className={`
            ${isSubmitting ? 'opacity-70' : ''}
            bg-[#e76f51] hover:bg-[#e76f51]/90 text-white px-8 py-2 rounded-md font-semibold text-lg
          `}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answers'}
        </Button>
      </div>
    </div>
  );
};

export default GridPage;
