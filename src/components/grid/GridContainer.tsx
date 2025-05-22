import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import Grid from "./Grid";
import { PuzzleDefinition } from "@/lib/types";
import SubmitButton from "./SubmitButton";
import Button from "./Button";

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
  // Mock values for timer and rarity - in a real app these would be calculated
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rarity, setRarity] = useState(65); // Mock rarity score (0-100)
  const [streak, setStreak] = useState(3); // Mock streak count
  
  // Simple timer for demonstration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
          
          {/* Stats bar with timer and rarity */}
          <div className="flex justify-between items-center bg-navy/5 p-3 rounded-lg">
            <span className="font-heading text-xl text-navy">{formatTime(elapsedTime)}</span>
            <span className="font-heading text-xl text-navy">{rarity}%</span>
            {/* Rarity gauge */}
            <div className="h-4 w-28 bg-navy/20 rounded-full overflow-hidden">
              <div 
                style={{width: `${rarity}%`}}
                className="bg-brick h-full transition-all duration-300" 
              />
            </div>
          </div>
          
          {/* Mobile streak display */}
          <div className="flex md:hidden items-center gap-2 text-brick font-semibold border border-gold bg-gold/10 p-2 rounded-lg">
            <Flame size={20} />
            <span>{streak}-DAY STREAK</span>
          </div>
        </div>
        
        {/* Placeholder for leaderboard panel - would be implemented with Tabs in full version */}
        <div className="hidden md:block bg-cream rounded-lg shadow-sm border border-navy/20 p-4 h-80">
          <h3 className="font-heading text-xl text-navy mb-4">Leaderboard</h3>
          <div className="text-center text-navy/50 mt-8">
            Coming soon!
          </div>
        </div>
      </div>
      
      {/* CTA buttons */}
      <div className="mt-6 flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
        <Button 
          variant="outline" 
          className="text-navy border-navy/40 hover:bg-navy/5 font-medium"
          onClick={() => {}}
        >
          Share Results
        </Button>
        
        <SubmitButton 
          onClick={handleSubmit} 
          isSubmitting={isSubmitting}
          disabled={!isGridComplete() || !areAllFilledCellsValid()} 
        />
      </div>
    </div>
  );
};

export default GridContainer;
