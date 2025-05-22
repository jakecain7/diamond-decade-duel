
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import GridCell from "@/components/GridCell";
import { supabase } from "@/integrations/supabase/client";
import { PuzzleDefinition } from "@/lib/types";
import { useGridState } from "@/hooks/useGridState";
import { format } from "date-fns";

const GridPage = () => {
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    fetchPuzzle();
  }, [today]);

  // Mock player validation function - in a real app, this would check against the database
  const validatePlayer = useCallback(async (
    playerName: string, 
    rowIndex: number, 
    colIndex: number,
    rowLabel: string,
    colLabel: string
  ) => {
    if (!playerName.trim()) return false;
    
    // For demo purposes, we'll just simulate a check after a delay
    // Later, this would be replaced with an actual database check
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // For now, we'll consider any name with at least 3 characters as valid
    // This is just for demo purposes
    return playerName.trim().length >= 3;
  }, []);

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
      
      // Get the row and column labels for validation context
      if (!puzzle) return;
      
      const rowLabel = rowIndex === 0 ? puzzle.row1_label : puzzle.row2_label;
      const colLabel = colIndex === 0 
        ? puzzle.col1_label 
        : colIndex === 1 
          ? puzzle.col2_label 
          : puzzle.col3_label;
      
      // Validate the player name against the criteria
      const isValid = await validatePlayer(cellValue, rowIndex, colIndex, rowLabel, colLabel);
      
      // Update the cell's validation state
      setCellValidation(rowIndex, colIndex, isValid);
      
      // Show feedback for invalid entries
      if (!isValid) {
        toast({
          title: "Invalid player",
          description: "This player doesn't match the criteria. Try another name.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error validating player:", err);
      setCellValidation(rowIndex, colIndex, false);
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
      
      // Lock all cells
      gridState.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          setCellValidation(rowIndex, colIndex, true, true);
        });
      });
      
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

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <p className="text-xl text-[#1d3557]">Loading today's puzzle...</p>
      </div>
    );
  }

  // Display error message if no puzzle is found
  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d3557] mb-8 font-serif italic">Double-Play Grid</h1>
        <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg p-8 text-center">
          <p className="text-xl text-[#e76f51]">{error || "No puzzle available for today. Please check back later!"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e1] flex flex-col items-center px-4 py-8">
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
