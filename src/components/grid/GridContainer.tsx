
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Grid from "./Grid";
import { PuzzleDefinition } from "@/lib/types";
import SubmitButton from "./SubmitButton";

interface GridContainerProps {
  puzzle: PuzzleDefinition;
  gridState: any[][];
  handleCellUpdate: (rowIndex: number, colIndex: number, value: string) => void;
  handleCellBlur: (rowIndex: number, colIndex: number) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  isGridComplete: () => boolean;
  areAllFilledCellsValid: () => boolean;
}

const GridContainer = ({ 
  puzzle, 
  gridState, 
  handleCellUpdate, 
  handleCellBlur, 
  handleSubmit,
  isSubmitting,
  isGridComplete,
  areAllFilledCellsValid
}: GridContainerProps) => {
  return (
    <>
      <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg">
        <CardContent className="p-6">
          <Grid 
            puzzle={puzzle} 
            gridState={gridState} 
            handleCellUpdate={handleCellUpdate} 
            handleCellBlur={handleCellBlur} 
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <SubmitButton 
          onClick={handleSubmit} 
          isSubmitting={isSubmitting}
          disabled={!isGridComplete() || !areAllFilledCellsValid()} 
        />
      </div>
    </>
  );
};

export default GridContainer;
