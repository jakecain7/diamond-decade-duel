
import React from 'react';
import { useForgottenUniformsGame } from '@/hooks/useForgottenUniformsGame';
import LoadingDisplay from '@/components/grid/LoadingDisplay';
import QuestionCard from '@/components/forgotten-uniforms/QuestionCard';
import GameOverActions from '@/components/dinger-duel/GameOverActions';
import FeedbackMessage from '@/components/dinger-duel/FeedbackMessage';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GameHeader = ({ personalBestScore, streak }: { personalBestScore: number | null; streak: number }) => {
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
        FORGOTTEN UNIFORMS
      </h1>
      
      {renderLoginPrompt()}
    </>
  );
};

const ForgottenUniformsGame: React.FC = () => {
  const {
    currentQuestion,
    nextQuestion,
    score,
    streak,
    personalBestScore,
    isPersonalBest,
    gamePhase,
    isLoading,
    feedbackMessage,
    countdown,
    countdownType,
    selectedAnswer,
    handleAnswer,
    restartGame,
    showFeedback
  } = useForgottenUniformsGame();

  if (isLoading && gamePhase === 'loadingFirstPlayer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy p-6">
        <div className="w-full max-w-[460px] bg-cream rounded-3xl p-6 shadow-lg">
          <h1 className="text-3xl font-heading text-center text-navy">FORGOTTEN UNIFORMS</h1>
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingDisplay message="Loading questions..." />
          </div>
        </div>
      </div>
    );
  }

  // Determine if the answer buttons should be disabled
  const shouldDisableAnswers = isLoading || gamePhase === 'showingResult';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy p-6">
      <div className="w-full max-w-[600px] bg-cream rounded-3xl p-6 shadow-lg">
        <GameHeader personalBestScore={personalBestScore} streak={streak} />
        
        {/* Current Question Card */}
        {currentQuestion && (
          <QuestionCard 
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswer}
            disabled={shouldDisableAnswers}
            showResult={gamePhase === 'showingResult'}
            className={gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') ? 'animate-fade-out' : ''}
          />
        )}

        {/* Next Question Card (shows during result phase) */}
        {nextQuestion && gamePhase === 'showingResult' && !feedbackMessage.includes('Wrong') && (
          <QuestionCard 
            question={nextQuestion}
            selectedAnswer={null}
            onAnswerSelect={() => {}}
            disabled={true}
            showResult={false}
            className="animate-scale-in"
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

        {/* Game Over Actions */}
        {gamePhase === 'gameOver' && (
          <GameOverActions 
            score={score} 
            isPersonalBest={isPersonalBest}
            onRestart={restartGame}
          />
        )}
      </div>
    </div>
  );
};

export default ForgottenUniformsGame;
