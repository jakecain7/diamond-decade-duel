
import React from 'react';

interface FeedbackMessageProps {
  message: string;
  isGameOver: boolean;
  isLoading: boolean;
  countdown: number;
  countdownType: 'next' | 'reset';
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ 
  message, 
  isGameOver, 
  isLoading, 
  countdown, 
  countdownType 
}) => {
  if (!message) return null;
  
  return (
    <div className={`text-center text-lg mb-6 font-semibold ${isGameOver ? 'text-brick' : 'text-green-600'}`}>
      {message}
      {!isGameOver && (
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
  );
};

export default FeedbackMessage;
