
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PuzzleDefinition } from "@/lib/types";
import { format } from "date-fns";

export function usePuzzle() {
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

  return { puzzle, loading, error };
}
