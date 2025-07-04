
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRandomPlayer, Player } from '@/services/player-service';
import { fetchPersonalBestScore, submitScore } from '@/services/score-service';
import { GamePhase, CountdownType } from '@/types/game-types';

export function useHigherLowerGame() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [nextPlayer, setNextPlayer] = useState<Player | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [personalBestScore, setPersonalBestScore] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('loadingFirstPlayer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(3);
  const [countdownType, setCountdownType] = useState<CountdownType>('next');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  
  const { user } = useAuth();
  const gameSlug = 'higher-lower-hr';

  // Function to fetch user's personal best score
  const loadPersonalBest = useCallback(async () => {
    if (!user) return;
    const bestScore = await fetchPersonalBestScore(gameSlug);
    if (bestScore !== null) {
      setPersonalBestScore(bestScore);
    }
  }, [user, gameSlug]);

  // Initialize the game
  const initializeGame = useCallback(async () => {
    setGamePhase('loadingFirstPlayer');
    setIsLoading(true);
    setScore(0);
    setStreak(0);
    setFeedbackMessage('');
    setIsPersonalBest(false);
    setShowFeedback(false);

    try {
      // Fetch first player
      const firstPlayer = await fetchRandomPlayer();
      if (!firstPlayer) {
        toast.error('Failed to start game');
        return;
      }
      setCurrentPlayer(firstPlayer);

      // Fetch next player (excluding the first player and ensuring different HR count)
      const secondPlayer = await fetchRandomPlayer(firstPlayer.playerId, firstPlayer.careerHR);
      if (!secondPlayer) {
        toast.error('Failed to load next player');
        return;
      }
      setNextPlayer(secondPlayer);

      // Game is now ready for user to guess
      setGamePhase('waitingForGuess');
    } catch (error) {
      console.error('Error initializing game:', error);
      toast.error('Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle user guess
  const handleGuess = useCallback(async (guessHigher: boolean) => {
    if (!currentPlayer || !nextPlayer || gamePhase !== 'waitingForGuess') return;

    setGamePhase('showingResult');
    setIsLoading(true);
    setShowFeedback(true);

    const isCorrect = guessHigher 
      ? nextPlayer.careerHR >= currentPlayer.careerHR 
      : nextPlayer.careerHR < currentPlayer.careerHR;

    if (isCorrect) {
      // Correct guess
      const newScore = score + 1;
      setScore(newScore);
      setStreak(prevStreak => prevStreak + 1);
      setFeedbackMessage(`Correct! ${nextPlayer.playerName} had ${nextPlayer.careerHR} HRs.`);
      setCountdownType('next');
      
      // Add a pause before moving to the next player
      setIsLoading(false); // Allow UI to update during the pause
      setCountdown(3); // Initialize countdown to 3 seconds
      
      // Fetch new next player during the pause (excluding current next player and ensuring different HR count)
      const newNextPlayer = await fetchRandomPlayer(nextPlayer.playerId, nextPlayer.careerHR);
      
      // Set up countdown
      const countdownDuration = 3500; // 3.5 seconds
      const interval = 1000; // 1 second between countdown updates
      const startTime = Date.now();
      
      const countdownTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(3 - Math.floor(elapsed / 1000), 0);
        setCountdown(remaining);
        
        if (elapsed >= countdownDuration - 100) {
          clearInterval(countdownTimer);
          
          if (!newNextPlayer) {
            toast.error('Failed to load next player');
            setGamePhase('gameOver');
            return;
          }
        
          setCurrentPlayer(nextPlayer);
          setNextPlayer(newNextPlayer);
          setGamePhase('waitingForGuess');
          setShowFeedback(false);
        }
      }, interval);
      
    } else {
      // Wrong guess
      setFeedbackMessage(`Wrong! ${nextPlayer.playerName} had ${nextPlayer.careerHR} HRs. Game Over.`);
      setCountdownType('reset');
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore(score);
        toast.success(`New high score: ${score}!`);
      }
      
      // Submit the score to the backend
      if (user) {
        const result = await submitScore(gameSlug, score);
        if (result.isNewHighScore) {
          setIsPersonalBest(true);
          setPersonalBestScore(result.highScore);
        }
      }
      
      setIsLoading(false); // Allow UI to update
      setCountdown(3); // Initialize countdown to 3 seconds
      
      // Set up countdown
      const countdownDuration = 3500; // 3.5 seconds
      const interval = 1000; // 1 second between countdown updates
      const startTime = Date.now();
      
      const countdownTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(3 - Math.floor(elapsed / 1000), 0);
        setCountdown(remaining);
        
        if (elapsed >= countdownDuration - 100) {
          clearInterval(countdownTimer);
          setGamePhase('gameOver');
          setStreak(0);
          // Keep showing feedback for game over
        }
      }, interval);
    }
  }, [currentPlayer, nextPlayer, gamePhase, score, highScore, user, gameSlug]);

  // Initial setup: fetch personal best and initialize game
  useEffect(() => {
    loadPersonalBest();
    initializeGame();
  }, [initializeGame, loadPersonalBest]);

  // Function to restart the game
  const restartGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    currentPlayer,
    nextPlayer,
    score,
    streak,
    highScore,
    personalBestScore,
    isPersonalBest,
    gamePhase,
    isLoading,
    feedbackMessage,
    countdown,
    countdownType,
    handleGuess,
    restartGame,
    isAuthenticated: !!user,
    showFeedback
  };
}
