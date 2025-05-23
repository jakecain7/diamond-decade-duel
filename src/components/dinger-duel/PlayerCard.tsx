
import React from 'react';
import { Card } from '@/components/ui/card';

interface PlayerCardProps {
  playerName: string;
  homeRuns: string | number; // This only accepts string or number, not React Elements
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ playerName, homeRuns, className = '' }) => {
  return (
    <Card className={`mb-4 border-2 border-navy rounded-xl overflow-hidden shadow-md ${className}`}>
      <div className="p-4 text-center">
        <div className="font-bold text-navy">{playerName}</div>
        <div className="text-4xl font-heading font-bold text-navy py-4">
          {homeRuns}
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;
