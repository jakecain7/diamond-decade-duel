
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [gamePhase, setGamePhase] = useState<GamePhase>('loadingFirstPlayer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

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

  // Initialize the game
  const initializeGame = useCallback(async () => {
    setGamePhase('loadingFirstPlayer');
    setIsLoading(true);
    setScore(0);
    setStreak(0);
    setFeedbackMessage('');

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
      setScore(prevScore => prevScore + 1);
      setStreak(prevStreak => prevStreak + 1);
      setFeedbackMessage(`Correct! ${nextPlayer.playerName} had ${nextPlayer.careerHR} HRs.`);
      
      // Move to next round
      setCurrentPlayer(nextPlayer);
      
      // Fetch new next player
      const newNextPlayer = await fetchRandomPlayer(nextPlayer.playerId);
      if (!newNextPlayer) {
        toast.error('Failed to load next player');
        setGamePhase('gameOver');
      } else {
        setNextPlayer(newNextPlayer);
        setGamePhase('waitingForGuess');
      }
    } else {
      // Wrong guess
      setFeedbackMessage(`Wrong! ${nextPlayer.playerName} had ${nextPlayer.careerHR} HRs. Game Over.`);
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore(score);
        toast.success(`New high score: ${score}!`);
      }
      
      setGamePhase('gameOver');
      setStreak(0);
    }
    
    setIsLoading(false);
  }, [currentPlayer, nextPlayer, gamePhase, score, highScore, fetchRandomPlayer]);

  // Initial game setup
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

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
    gamePhase,
    isLoading,
    feedbackMessage,
    handleGuess,
    restartGame
  };
}
