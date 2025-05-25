
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { fetchForgottenUniformsQuestion, ForgottenUniformsQuestion } from '@/services/forgotten-uniforms-service';
import { fetchPersonalBestScore, submitScore } from '@/services/score-service';
import { GamePhase, CountdownType } from '@/types/game-types';

export function useForgottenUniformsGame() {
  const [currentQuestion, setCurrentQuestion] = useState<ForgottenUniformsQuestion | null>(null);
  const [nextQuestion, setNextQuestion] = useState<ForgottenUniformsQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [personalBestScore, setPersonalBestScore] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('loadingFirstPlayer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(3);
  const [countdownType, setCountdownType] = useState<CountdownType>('next');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const { user } = useAuth();
  const gameSlug = 'forgotten-uniforms';

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
    setSelectedAnswer(null);

    try {
      // Fetch first question
      const firstQuestion = await fetchForgottenUniformsQuestion();
      if (!firstQuestion) {
        toast.error('Failed to start game');
        return;
      }
      setCurrentQuestion(firstQuestion);

      // Fetch next question (for smooth transitions)
      const secondQuestion = await fetchForgottenUniformsQuestion();
      if (!secondQuestion) {
        toast.error('Failed to load next question');
        return;
      }
      setNextQuestion(secondQuestion);

      // Game is now ready for user to answer
      setGamePhase('waitingForGuess');
    } catch (error) {
      console.error('Error initializing game:', error);
      toast.error('Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle user answer
  const handleAnswer = useCallback(async (answerId: string) => {
    if (!currentQuestion || !nextQuestion || gamePhase !== 'waitingForGuess') return;

    setSelectedAnswer(answerId);
    setGamePhase('showingResult');
    setIsLoading(true);
    setShowFeedback(true);

    const correctChoice = currentQuestion.choices.find(choice => choice.isCorrect);
    const isCorrect = answerId === correctChoice?.id;

    if (isCorrect) {
      // Correct answer - create more detailed feedback message
      const newScore = score + 1;
      setScore(newScore);
      setStreak(prevStreak => prevStreak + 1);
      setFeedbackMessage(`Correct! ${currentQuestion.playerName} played for the ${currentQuestion.forgottenTeamName} in ${currentQuestion.stintYears}.`);
      setCountdownType('next');
      
      // Add a pause before moving to the next question
      setIsLoading(false);
      setCountdown(3);
      
      // Fetch new next question during the pause
      const newNextQuestion = await fetchForgottenUniformsQuestion();
      
      // Set up countdown
      const countdownDuration = 3500; // 3.5 seconds
      const interval = 1000;
      const startTime = Date.now();
      
      const countdownTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(3 - Math.floor(elapsed / 1000), 0);
        setCountdown(remaining);
        
        if (elapsed >= countdownDuration - 100) {
          clearInterval(countdownTimer);
          
          if (!newNextQuestion) {
            toast.error('Failed to load next question');
            setGamePhase('gameOver');
            return;
          }
        
          setCurrentQuestion(nextQuestion);
          setNextQuestion(newNextQuestion);
          setGamePhase('waitingForGuess');
          setShowFeedback(false);
          setSelectedAnswer(null);
        }
      }, interval);
      
    } else {
      // Wrong answer - updated message format
      setFeedbackMessage(`Wrong! ${currentQuestion.playerName} played for ${currentQuestion.forgottenTeamName} in ${currentQuestion.stintYears}. Game Over.`);
      setCountdownType('reset');
      
      // Submit the score to the backend
      if (user) {
        const result = await submitScore(gameSlug, score);
        if (result.isNewHighScore) {
          setIsPersonalBest(true);
          setPersonalBestScore(result.highScore);
        }
      }
      
      setIsLoading(false);
      setCountdown(3);
      
      // Set up countdown
      const countdownDuration = 3500;
      const interval = 1000;
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
  }, [currentQuestion, nextQuestion, gamePhase, score, user, gameSlug]);

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
    isAuthenticated: !!user,
    showFeedback
  };
}
