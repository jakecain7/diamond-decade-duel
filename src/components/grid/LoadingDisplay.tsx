
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingDisplay = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#1d3557]" />
      <p className="text-xl text-[#1d3557]">{message}</p>
    </div>
  );
};

export default LoadingDisplay;
