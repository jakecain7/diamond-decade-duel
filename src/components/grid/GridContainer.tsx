
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Grid from "./Grid";
import { PuzzleDefinition } from "@/lib/types";
import GridStats from "./GridStats";
import LeaderboardPanel from "./LeaderboardPanel";
import GridActions from "./GridActions";
import { useGridTimer } from "@/hooks/useGridTimer";

interface GridContainerProps {
  puzzle: PuzzleDefinition;
  gridState: any[][];
  handleCellUpdate: (rowIndex: number, colIndex: number, value: string, playerId?: string) => void;
  handleCellBlur?: (rowIndex: number, colIndex: number) => void;
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
  // Mock rarity score and streak - in a real app these would be calculated
  const [rarity] = useState(65); // Mock rarity score (0-100)
  const [streak] = useState(3); // Mock streak count
  const { elapsedTime } = useGridTimer();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-cream rounded-2xl ring-1 ring-[#e0d8c4]">
      <h1 className="font-heading text-4xl md:text-5xl text-navy mb-8 text-center">Double-Play Grid</h1>
      
      <div className="md:grid md:grid-cols-[2fr,1fr] gap-4">
        <div className="space-y-4">
          {/* Main Grid Card */}
          <Card className="rounded-2xl border-2 border-navy shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <CardContent className="p-6">
              <Grid 
                puzzle={puzzle} 
                gridState={gridState} 
                handleCellUpdate={handleCellUpdate} 
                handleCellBlur={handleCellBlur} 
              />
            </CardContent>
          </Card>
          
          <GridStats 
            elapsedTime={elapsedTime}
            rarity={rarity}
            streak={streak}
          />
        </div>
        
        <LeaderboardPanel />
      </div>
      
      <GridActions 
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isGridComplete={isGridComplete()}
      />
    </div>
  );
};

export default GridContainer;
