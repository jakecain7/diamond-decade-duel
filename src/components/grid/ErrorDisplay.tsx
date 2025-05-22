
import React from "react";
import { Card } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <Card className="w-full max-w-3xl border-2 border-navy shadow-lg p-8 text-center rounded-2xl">
      <p className="text-xl text-brick">
        {error || "No puzzle available for today. Please check back later!"}
      </p>
    </Card>
  );
};

export default ErrorDisplay;
