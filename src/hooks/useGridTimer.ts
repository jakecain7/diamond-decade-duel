
import { useState, useEffect } from "react";

export function useGridTimer() {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Simple timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return { elapsedTime };
}
