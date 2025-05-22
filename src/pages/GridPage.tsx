
import React from "react";
import AuthRequired from "@/components/grid/AuthRequired";
import PuzzleContent from "@/components/grid/PuzzleContent";
import { usePuzzle } from "@/hooks/usePuzzle";
import { useAuth } from "@/contexts/AuthContext";

const GridPage = () => {
  const { user } = useAuth();
  const { puzzle, loading, error } = usePuzzle();
  
  return (
    <AuthRequired>
      <PuzzleContent 
        puzzle={puzzle}
        loading={loading}
        error={error}
      />
    </AuthRequired>
  );
};

export default GridPage;
