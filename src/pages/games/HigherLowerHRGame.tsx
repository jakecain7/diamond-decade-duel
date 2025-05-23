
import React from 'react';
import { useHigherLowerGame } from '@/hooks/useHigherLowerGame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trophy, Share2 } from 'lucide-react';
import LoadingDisplay from '@/components/grid/LoadingDisplay';
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

  const handleFacebookShare = () => {
    const shareUrl = "https://diamond-decade-duel.lovable.app/";
    const shareMessage = `Just got a score of ${score} on Dinger Duel! Think you can beat me? Play here: ${shareUrl}`;
    
    // Create the Facebook share URL with encoded parameters
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedQuote = encodeURIComponent(shareMessage);
    const facebookShareUrl = `https://www.facebook.com/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`;
    
    // Open Facebook share dialog in a popup window
    window.open(facebookShareUrl, 'facebook-share', 'width=600,height=400');
    toast.success("Opening Facebook share dialog...");
  };

  if (isLoading && gamePhase === 'loadingFirstPlayer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy p-6">
        <div className="w-full max-w-[460px] bg-cream rounded-3xl p-6 shadow-lg">
          <h1 className="text-3xl font-heading text-center text-navy">DINGER DUEL</h1>
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingDisplay message="Loading players..." />
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy p-6">
      <div className="w-full max-w-[460px] bg-cream rounded-3xl p-6 shadow-lg">
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
        
        {/* Current Player Card */}
        <Card className={`mb-4 border-2 border-navy rounded-xl overflow-hidden shadow-md ${gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') ? 'animate-fade-out' : ''}`}>
          <div className="p-4 text-center">
            <div className="font-bold text-navy">{currentPlayer?.playerName}</div>
            <div className="text-4xl font-heading font-bold text-navy py-4">
              {currentPlayer?.careerHR} HR
            </div>
          </div>
        </Card>

        {/* Next Player Card */}
        {nextPlayer && (
          <Card className={`mb-8 border-2 border-navy rounded-xl overflow-hidden shadow-md ${gamePhase === 'showingResult' && feedbackMessage.includes('Wrong') ? 'animate-shake' : gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') ? 'animate-scale-in' : ''}`}>
            <div className="p-4 text-center">
              <div className="font-bold text-navy">
                {gamePhase === 'showingResult' || gamePhase === 'gameOver' 
                  ? nextPlayer.playerName 
                  : nextPlayer.playerName}
              </div>
              <div className="text-4xl font-heading font-bold text-navy py-4">
                {gamePhase === 'showingResult' || gamePhase === 'gameOver' 
                  ? `${nextPlayer.careerHR} HR` 
                  : <span className="opacity-40">???</span>}
              </div>
            </div>
          </Card>
        )}

        {/* Feedback Message with Countdown */}
        {feedbackMessage && (
          <div className={`text-center text-lg mb-6 font-semibold ${gamePhase === 'gameOver' ? 'text-brick' : 'text-green-600'}`}>
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

        {/* Game Controls */}
        <div className="flex flex-col gap-4">
          {(gamePhase === 'waitingForGuess') && (
            <div className="text-center text-lg font-semibold mb-4">
              Does {nextPlayer?.playerName} have higher or lower career home runs than {currentPlayer?.playerName}?
            </div>
          )}
          
          {gamePhase === 'waitingForGuess' && (
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => handleGuess(true)}
                className="bg-gold hover:bg-gold/90 text-navy border-2 border-navy font-bold text-lg uppercase h-14 rounded-xl shadow-inner"
                disabled={shouldDisableGuessButtons}
              >
                <ArrowUp className="mr-2" /> HIGHER
              </Button>
              <Button 
                onClick={() => handleGuess(false)}
                className="bg-gold hover:bg-gold/90 text-navy border-2 border-navy font-bold text-lg uppercase h-14 rounded-xl shadow-inner"
                disabled={shouldDisableGuessButtons}
              >
                <ArrowDown className="mr-2" /> LOWER
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
                onClick={restartGame}
                className="bg-navy hover:bg-navy/90 text-cream border-2 border-navy/20 font-bold text-lg uppercase h-14 w-full rounded-xl shadow-inner"
              >
                Play Again
              </Button>
              {score > 0 && (
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  className="text-navy border-navy/40 hover:bg-navy/5 font-bold text-lg uppercase h-14 w-full rounded-xl"
                >
                  <Share2 className="mr-2" size={18} /> Challenge Friends on Facebook
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherLowerHRGame;
