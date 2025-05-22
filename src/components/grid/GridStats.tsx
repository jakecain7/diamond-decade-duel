
import React from "react";
import { Flame } from "lucide-react";

interface GridStatsProps {
  elapsedTime: number;
  rarity: number;
  streak: number;
}

const GridStats = ({ elapsedTime, rarity, streak }: GridStatsProps) => {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
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
    </>
  );
};

export default GridStats;
