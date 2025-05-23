
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface GameOverActionsProps {
  score: number;
  isPersonalBest: boolean;
  onRestart: () => void;
}

const GameOverActions: React.FC<GameOverActionsProps> = ({ 
  score, 
  isPersonalBest, 
  onRestart 
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {isPersonalBest && (
        <div className="text-amber-500 font-bold flex items-center gap-2 mb-2">
          <Trophy size={24} />
          <span>New Personal Best!</span>
        </div>
      )}
      <Button
        onClick={onRestart}
        className="bg-navy hover:bg-navy/90 text-cream border-2 border-navy/20 font-bold text-lg uppercase h-14 w-full rounded-xl shadow-inner"
      >
        Play Again
      </Button>
    </div>
  );
};

export default GameOverActions;
