
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface GuessButtonsProps {
  onHigherGuess: () => void;
  onLowerGuess: () => void;
  disabled: boolean;
  currentPlayerName: string;
  nextPlayerName: string;
}

const GuessButtons: React.FC<GuessButtonsProps> = ({ 
  onHigherGuess, 
  onLowerGuess, 
  disabled, 
  currentPlayerName, 
  nextPlayerName 
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center text-lg font-semibold mb-4">
        Does {nextPlayerName} have higher or lower career home runs than {currentPlayerName}?
      </div>
      <Button 
        onClick={onHigherGuess}
        className="bg-gold hover:bg-gold/90 text-navy border-2 border-navy font-bold text-lg uppercase h-14 rounded-xl shadow-inner"
        disabled={disabled}
      >
        <ArrowUp className="mr-2" /> HIGHER
      </Button>
      <Button 
        onClick={onLowerGuess}
        className="bg-gold hover:bg-gold/90 text-navy border-2 border-navy font-bold text-lg uppercase h-14 rounded-xl shadow-inner"
        disabled={disabled}
      >
        <ArrowDown className="mr-2" /> LOWER
      </Button>
    </div>
  );
};

export default GuessButtons;
