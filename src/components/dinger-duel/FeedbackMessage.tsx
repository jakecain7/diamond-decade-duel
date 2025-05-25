
import React from 'react';
import { CountdownType } from '@/types/game-types';

interface FeedbackMessageProps {
  message: string;
  isGameOver: boolean;
  isLoading: boolean;
  countdown: number;
  countdownType: CountdownType;
  showFeedback: boolean;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  isGameOver,
  isLoading,
  countdown,
  countdownType,
  showFeedback
}) => {
  if (!showFeedback || !message) return null;

  const isCorrect = message.toLowerCase().includes('correct');
  const isWrong = message.toLowerCase().includes('wrong');

  return (
    <div className="text-center py-4">
      {/* Display the full feedback message */}
      <div className={`text-lg font-semibold mb-2 ${
        isCorrect ? 'text-green-600' : 
        isWrong ? 'text-red-600' : 
        'text-baseball-green'
      }`}>
        {message}
      </div>

      {/* Show countdown unless it's game over */}
      {!isGameOver && countdown > 0 && (
        <div className="text-sm text-baseball-green/70">
          {countdownType === 'next' ? 'Next question' : 'Restarting'} in: {countdown}
        </div>
      )}
    </div>
  );
};

export default FeedbackMessage;
