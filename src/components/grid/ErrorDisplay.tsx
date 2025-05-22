
import React from "react";
import { Card } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg p-8 text-center">
      <p className="text-xl text-[#e76f51]">
        {error || "No puzzle available for today. Please check back later!"}
      </p>
    </Card>
  );
};

export default ErrorDisplay;
