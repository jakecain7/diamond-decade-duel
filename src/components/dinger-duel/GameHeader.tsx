
import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface GameHeaderProps {
  personalBestScore: number | null;
  streak: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ personalBestScore, streak }) => {
  const { user, loading: authLoading } = useAuth();

  // Login prompt for unauthenticated users
  const renderLoginPrompt = () => {
    if (authLoading) return null;
    
    if (!user) {
      return (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <Trophy className="text-amber-500 mr-2 mt-1" size={18} />
            <div>
              <p className="text-amber-800 font-medium">Sign in to save your high scores!</p>
              <p className="text-amber-700 text-sm mt-1">
                <Link to="/dashboard" className="underline hover:text-amber-900">Sign in</Link> to track your personal best and compete on the leaderboard.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Score and Streak Bar */}
      <div className="flex justify-between items-center bg-navy text-cream p-4 rounded-lg mb-6 h-16">
        <div className="text-center">
          <div className="text-xs font-medium uppercase">High Score</div>
          <div className="text-2xl font-bold">{personalBestScore || 0}</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs font-medium uppercase">Streak</div>
          <div className="text-2xl font-bold">{streak}x</div>
        </div>
      </div>
      
      {/* Title */}
      <h1 className="font-heading text-2xl text-center text-navy tracking-wide mb-6">
        DINGER DUEL
      </h1>
      
      {renderLoginPrompt()}
    </>
  );
};

export default GameHeader;
