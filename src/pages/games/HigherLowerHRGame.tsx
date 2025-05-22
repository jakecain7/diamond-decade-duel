
import React from 'react';
import { useHigherLowerGame } from '@/hooks/useHigherLowerGame';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import LoadingDisplay from '@/components/grid/LoadingDisplay';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const HigherLowerHRGame: React.FC = () => {
  const {
    currentPlayer,
    nextPlayer,
    score,
    streak,
    personalBestScore,
    isPersonalBest,
    gamePhase,
    isLoading,
    feedbackMessage,
    countdown,
    countdownType,
    handleGuess,
    restartGame,
    isAuthenticated
  } = useHigherLowerGame();
  
  const { user, loading: authLoading } = useAuth();

  if (isLoading && gamePhase === 'loadingFirstPlayer') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-navy">Higher or Lower: Career HR</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingDisplay message="Loading players..." />
        </div>
      </div>
    );
  }

  // Format the career span text
  const formatCareerSpan = (debutYear?: number | null, finalYear?: number | null) => {
    if (debutYear && finalYear) {
      return `${debutYear} - ${finalYear}`;
    } else if (debutYear) {
      return `${debutYear} - present`;
    }
    return 'Career span unknown';
  };

  // Format teams played for
  const formatTeams = (teams?: string[]) => {
    if (!teams || teams.length === 0) return 'Teams unknown';
    return teams.join(', ');
  };

  // Determine if the guess buttons should be disabled
  const shouldDisableGuessButtons = isLoading || gamePhase === 'showingResult';

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-navy">Higher or Lower: Career HR</h1>
      
      {renderLoginPrompt()}
      
      {/* Score and Streak Display */}
      <div className="flex justify-between mb-6">
        <div className="text-lg font-semibold">Score: {score}</div>
        <div className="text-lg font-semibold">Streak: {streak}</div>
        {isAuthenticated && personalBestScore !== null && (
          <div className="text-lg font-semibold flex items-center">
            <Trophy className="mr-1 text-amber-500" size={18} /> 
            <span className={isPersonalBest ? "text-amber-500 font-bold" : ""}>
              Best: {personalBestScore}
            </span>
          </div>
        )}
      </div>

      {/* Current Player Card */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{currentPlayer?.playerName}</CardTitle>
          <CardDescription>Current Player</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-center py-6 text-brick">
            {currentPlayer?.careerHR} HRs
          </div>
          <div className="mt-4 text-sm">
            <div className="mb-1">
              <span className="font-semibold">Career: </span>
              {formatCareerSpan(currentPlayer?.debutYear, currentPlayer?.finalYear)}
            </div>
            <div>
              <span className="font-semibold">Teams: </span>
              {formatTeams(currentPlayer?.teamsPlayedFor)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Player Card */}
      {nextPlayer && (
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{nextPlayer.playerName}</CardTitle>
            <CardDescription>Next Player</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center py-6">
              {gamePhase === 'showingResult' || gamePhase === 'gameOver' 
                ? `${nextPlayer.careerHR} HRs` 
                : '?'}
            </div>
            
            {/* Always show the nextPlayer's career and team details */}
            <div className="mt-4 text-sm">
              <div className="mb-1">
                <span className="font-semibold">Career: </span>
                {formatCareerSpan(nextPlayer?.debutYear, nextPlayer?.finalYear)}
              </div>
              <div>
                <span className="font-semibold">Teams: </span>
                {formatTeams(nextPlayer?.teamsPlayedFor)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Message with Countdown */}
      {feedbackMessage && (
        <div className={`text-center text-lg mb-6 font-semibold ${gamePhase === 'gameOver' ? 'text-red-600' : 'text-green-600'}`}>
          {feedbackMessage}
          {gamePhase === 'showingResult' && (
            <div className="text-gray-500 text-sm mt-2">
              {isLoading 
                ? "Loading next player..." 
                : countdownType === 'next' 
                  ? `Next question in: ${countdown}` 
                  : `Resetting in: ${countdown}`
              }
            </div>
          )}
        </div>
      )}

      <Separator className="my-6" />

      {/* Game Controls */}
      <div className="flex flex-col gap-4">
        {(gamePhase === 'waitingForGuess') && (
          <div className="text-center text-lg font-semibold mb-4">
            Does {nextPlayer?.playerName} have higher or lower career home runs than {currentPlayer?.playerName}?
          </div>
        )}
        
        {gamePhase === 'waitingForGuess' && (
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => handleGuess(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              disabled={shouldDisableGuessButtons}
            >
              <ArrowUp className="mr-2" /> Higher
            </Button>
            <Button 
              size="lg" 
              onClick={() => handleGuess(false)}
              className="bg-brick hover:bg-brick/90 text-white px-8 py-4 text-lg"
              disabled={shouldDisableGuessButtons}
            >
              <ArrowDown className="mr-2" /> Lower
            </Button>
          </div>
        )}
        
        {gamePhase === 'gameOver' && (
          <div className="flex flex-col items-center gap-4">
            {isPersonalBest && (
              <div className="text-amber-500 font-bold flex items-center gap-2 mb-2">
                <Trophy size={24} />
                <span>New Personal Best!</span>
              </div>
            )}
            <Button
              size="lg"
              onClick={restartGame}
              className="bg-navy hover:bg-navy/90 text-white px-8 py-4 text-lg"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HigherLowerHRGame;
