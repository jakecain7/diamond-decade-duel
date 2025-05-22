
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
  onClick: () => void;
}

const SubmitButton = ({ isSubmitting, disabled, onClick }: SubmitButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isSubmitting || disabled}
      className={`
        ${isSubmitting ? 'opacity-70' : ''}
        bg-brick hover:bg-brick/90 text-cream px-8 py-2 rounded-md font-semibold text-lg
      `}
    >
      {isSubmitting ? 'Submitting...' : 'Submit Answers'}
    </Button>
  );
};

export default SubmitButton;
