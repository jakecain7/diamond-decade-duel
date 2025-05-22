
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Player {
  playerId: string;
  playerName: string;
  careerHR: number;
  debutYear?: number | null;
  finalYear?: number | null;
  teamsPlayedFor?: string[];
}

type GamePhase = 
  | 'loadingFirstPlayer' 
  | 'showingCurrentPlayer' 
  | 'waitingForGuess' 
  | 'showingResult' 
  | 'gameOver';

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
  const [countdownType, setCountdownType] = useState<'next' | 'reset'>('next');
  
  const { user } = useAuth();
  const gameSlug = 'higher-lower-hr';

  // Function to fetch a random player
  const fetchRandomPlayer = useCallback(async (excludePlayerId?: string): Promise<Player | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-random-hl-player', {
        body: { excludePlayerId }
      });

      if (error) {
        console.error('Error fetching random player:', error);
        toast.error('Failed to load player data');
        return null;
      }

      return {
        playerId: data.playerId,
        playerName: data.playerName,
        careerHR: data.careerHR,
        debutYear: data.debutYear,
        finalYear: data.finalYear,
        teamsPlayedFor: data.teamsPlayedFor
      };
    } catch (error) {
      console.error('Exception fetching random player:', error);
      toast.error('Failed to load player data');
      return null;
    }
  }, []);

  // Function to fetch user's personal best score
  const fetchPersonalBestScore = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-user-game-score', {
        body: { gameSlug }
      });

      if (error) {
        console.error('Error fetching personal best score:', error);
        return;
      }

      if (data && typeof data.highScore === 'number') {
        setPersonalBestScore(data.highScore);
      }
    } catch (error) {
      console.error('Exception fetching personal best score:', error);
    }
  }, [user, gameSlug]);

  // Function to submit the user's score
  const submitScore = useCallback(async (finalScore: number) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-hl-score', {
        body: { gameSlug, score: finalScore }
      });

      if (error) {
        console.error('Error submitting score:', error);
        return;
      }

      if (data?.isNewHighScore) {
        setIsPersonalBest(true);
        setPersonalBestScore(data.highScore);
        toast.success(`New personal best: ${data.highScore}!`);
      }
    } catch (error) {
      console.error('Exception submitting score:', error);
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

    try {
      // Fetch first player
      const firstPlayer = await fetchRandomPlayer();
      if (!firstPlayer) {
        toast.error('Failed to start game');
        return;
      }
      setCurrentPlayer(firstPlayer);

      // Fetch next player (excluding the first player)
      const secondPlayer = await fetchRandomPlayer(firstPlayer.playerId);
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
  }, [fetchRandomPlayer]);

  // Handle user guess
  const handleGuess = useCallback(async (guessHigher: boolean) => {
    if (!currentPlayer || !nextPlayer || gamePhase !== 'waitingForGuess') return;

    setGamePhase('showingResult');
    setIsLoading(true);

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
      
      // Fetch new next player during the pause
      const newNextPlayer = await fetchRandomPlayer(nextPlayer.playerId);
      
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
      submitScore(score);
      
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
        }
      }, interval);
    }
  }, [currentPlayer, nextPlayer, gamePhase, score, highScore, fetchRandomPlayer, submitScore]);

  // Initial setup: fetch personal best and initialize game
  useEffect(() => {
    fetchPersonalBestScore();
    initializeGame();
  }, [initializeGame, fetchPersonalBestScore]);

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
    isAuthenticated: !!user
  };
}
