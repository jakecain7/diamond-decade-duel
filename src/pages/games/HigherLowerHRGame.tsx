
import React from 'react';
import { useHigherLowerGame } from '@/hooks/useHigherLowerGame';
import LoadingDisplay from '@/components/grid/LoadingDisplay';
import GameHeader from '@/components/dinger-duel/GameHeader';
import PlayerCard from '@/components/dinger-duel/PlayerCard';
import GuessButtons from '@/components/dinger-duel/GuessButtons';
import GameOverActions from '@/components/dinger-duel/GameOverActions';
import FeedbackMessage from '@/components/dinger-duel/FeedbackMessage';

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
    showFeedback
  } = useHigherLowerGame();

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy p-6">
      <div className="w-full max-w-[460px] bg-cream rounded-3xl p-6 shadow-lg">
        <GameHeader personalBestScore={personalBestScore} streak={streak} />
        
        {/* Current Player Card */}
        {currentPlayer && (
          <PlayerCard 
            playerName={currentPlayer.playerName} 
            homeRuns={`${currentPlayer.careerHR} HR`}
            className={gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') ? 'animate-fade-out' : ''}
          />
        )}

        {/* Next Player Card */}
        {nextPlayer && (
          <PlayerCard 
            playerName={nextPlayer.playerName} 
            homeRuns={
              gamePhase === 'showingResult' || gamePhase === 'gameOver'
                ? `${nextPlayer.careerHR} HR` 
                : "???" // Using string instead of React Element
            }
            className={`mb-8 ${gamePhase === 'showingResult' && feedbackMessage.includes('Wrong') ? 'animate-shake' : gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') ? 'animate-scale-in' : ''}`}
          />
        )}

        {/* Feedback Message with Countdown */}
        <FeedbackMessage 
          message={feedbackMessage}
          isGameOver={gamePhase === 'gameOver'}
          isLoading={isLoading}
          countdown={countdown}
          countdownType={countdownType}
          showFeedback={showFeedback}
        />

        {/* Game Controls */}
        <div className="flex flex-col gap-4">
          {gamePhase === 'waitingForGuess' && currentPlayer && nextPlayer && (
            <GuessButtons 
              onHigherGuess={() => handleGuess(true)}
              onLowerGuess={() => handleGuess(false)}
              disabled={shouldDisableGuessButtons}
              currentPlayerName={currentPlayer.playerName}
              nextPlayerName={nextPlayer.playerName}
            />
          )}
          
          {gamePhase === 'gameOver' && (
            <GameOverActions 
              score={score} 
              isPersonalBest={isPersonalBest}
              onRestart={restartGame}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherLowerHRGame;
