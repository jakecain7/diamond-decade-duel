
import React from 'react';

interface FeedbackMessageProps {
  message: string;
  isGameOver: boolean;
  isLoading: boolean;
  countdown: number;
  countdownType: 'next' | 'reset';
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
  if (!message || !showFeedback) return null;
  
  // Check if the message contains "Correct" to apply special styling
  const isCorrect = message.includes("Correct");
  
  return (
    <div className={`text-center mb-6`}>
      {isGameOver ? (
        <div className="text-brick font-semibold text-lg">{message}</div>
      ) : isCorrect ? (
        <div className="flex flex-col items-center">
          <div className="font-bold text-xl text-green-600 mb-2">Correct!</div>
          {!isLoading && countdownType === 'next' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              Next question in: {countdown}
            </div>
          )}
          {isLoading && (
            <div className="text-gray-500 text-sm">Loading next player...</div>
          )}
        </div>
      ) : (
        <div>
          <div className="font-semibold text-lg text-brick">{message}</div>
          {!isGameOver && !isLoading && countdownType === 'reset' && (
            <div className="text-gray-500 text-sm mt-2">
              Resetting in: {countdown}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackMessage;
