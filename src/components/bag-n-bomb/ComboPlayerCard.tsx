
import React from 'react';
import { Card } from '@/components/ui/card';

interface ComboPlayerCardProps {
  playerName: string;
  careerSB?: number;
  careerHR?: number;
  comboTotal?: number;
  showStats?: boolean;
  className?: string;
}

const ComboPlayerCard: React.FC<ComboPlayerCardProps> = ({ 
  playerName, 
  careerSB, 
  careerHR, 
  comboTotal, 
  showStats = true, 
  className = '' 
}) => {
  return (
    <Card className={`mb-4 border-2 border-navy rounded-xl overflow-hidden shadow-md ${className}`}>
      <div className="p-4 text-center">
        <div className="font-bold text-navy">{playerName}</div>
        {showStats && careerSB !== undefined && careerHR !== undefined && comboTotal !== undefined ? (
          <div className="py-4">
            <div className="text-lg text-navy mb-2">
              {careerSB} SB + {careerHR} HR
            </div>
            <div className="text-4xl font-heading font-bold text-navy">
              = {comboTotal}
            </div>
          </div>
        ) : (
          <div className="text-4xl font-heading font-bold text-navy py-4">
            ???
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComboPlayerCard;
