
import React from "react";
import Button from "./Button";
import SubmitButton from "./SubmitButton";

interface GridActionsProps {
  handleSubmit: () => void;
  isSubmitting: boolean;
  isGridComplete: boolean;
}

const GridActions = ({ handleSubmit, isSubmitting, isGridComplete }: GridActionsProps) => {
  return (
    <div className="mt-6 flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
      <Button 
        variant="outline" 
        className="text-navy border-navy/40 hover:bg-navy/5 font-medium"
        onClick={() => {}}
      >
        Share Results
      </Button>
      
      <SubmitButton 
        onClick={handleSubmit} 
        isSubmitting={isSubmitting}
        disabled={!isGridComplete} 
      />
    </div>
  );
};

export default GridActions;
