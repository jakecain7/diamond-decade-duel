
import React from 'react';
import { ForgottenUniformsQuestion } from '@/services/forgotten-uniforms-service';

interface QuestionCardProps {
  question: ForgottenUniformsQuestion;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  disabled: boolean;
  showResult: boolean;
  className?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled,
  showResult,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-md border-2 border-baseball-green/20 mb-6 ${className}`}>
      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-baseball-green mb-2">
          Which team did this player have a forgotten stint with?
        </h2>
        <div className="text-2xl font-bold text-navy">
          {question.playerName}
        </div>
        <div className="text-sm text-baseball-green/70 mt-1">
          (1-2 seasons with a non-primary team)
        </div>
      </div>

      {/* Answer Choices */}
      <div className="grid grid-cols-1 gap-3">
        {question.choices.map((choice) => {
          let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium ';
          
          if (disabled) {
            if (showResult) {
              if (choice.isCorrect) {
                buttonClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (selectedAnswer === choice.id) {
                buttonClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                buttonClass += 'bg-gray-100 border-gray-300 text-gray-600';
              }
            } else {
              buttonClass += 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed';
            }
          } else {
            if (selectedAnswer === choice.id) {
              buttonClass += 'bg-baseball-green text-cream border-baseball-green';
            } else {
              buttonClass += 'bg-white border-baseball-green/30 text-baseball-green hover:bg-baseball-green/5 hover:border-baseball-green cursor-pointer';
            }
          }

          return (
            <button
              key={choice.id}
              onClick={() => !disabled && onAnswerSelect(choice.id)}
              disabled={disabled}
              className={buttonClass}
            >
              {choice.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
