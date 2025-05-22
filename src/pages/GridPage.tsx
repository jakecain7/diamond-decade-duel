
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PuzzleDefinition } from "@/lib/types";
import { format } from "date-fns";

const GridPage = () => {
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        setPuzzle(data as PuzzleDefinition);
      } catch (err) {
        console.error("Failed to fetch puzzle:", err);
        setError("An error occurred while loading the puzzle. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, [today]);

  const handleSubmit = () => {
    console.log("Submitting answers");
    // This will be implemented later with validation logic
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
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2">
            <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
              <span className="text-[#1d3557] text-center">{puzzle.row2_label}</span>
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button 
          onClick={handleSubmit} 
          className="bg-[#e76f51] hover:bg-[#e76f51]/90 text-white px-8 py-2 rounded-md font-semibold text-lg"
        >
          Submit Answers
        </Button>
      </div>
    </div>
  );
};

export default GridPage;
