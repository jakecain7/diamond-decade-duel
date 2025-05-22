
import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { GridCell as GridCellType } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AutocompleteInput from "@/components/grid/AutocompleteInput";

interface GridCellProps {
  cell: GridCellType;
  rowIndex: number;
  colIndex: number;
  onValueChange: (value: string, playerId?: string) => void;
  onBlur?: () => void; // Now optional since we're not using it for immediate validation
}

const GridCell = ({ cell, rowIndex, colIndex, onValueChange, onBlur }: GridCellProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Handle animation for invalid entries
  useEffect(() => {
    if (cell.isValid === false && !cell.isValidating) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [cell.isValid, cell.isValidating]);

  const handleValueChange = (value: string, playerId?: string) => {
    onValueChange(value, playerId);
  };

  return (
    <div className={`
      relative h-20 md:h-24 
      ${cell.isLocked ? 'bg-gold/90' : 'bg-cream/95 hover:bg-cream'}
      ${isShaking ? 'animate-shake' : ''}
      ${cell.isValid === false ? 'bg-cream/95' : ''}
      shadow-inner transition-colors
    `}>
      <AutocompleteInput 
        value={cell.value}
        onChange={handleValueChange}
        disabled={cell.isLocked}
        className="w-full h-full border-none"
      />
      
      {cell.isValidating && (
        <div className="absolute right-2 bottom-2">
          <Loader2 className="h-4 w-4 animate-spin text-brick" />
        </div>
      )}
      
      {cell.isValid === true && cell.value !== "" && !cell.isValidating && (
        <div className="absolute right-2 bottom-2">
          <Check className="h-4 w-4 text-green-600" />
        </div>
      )}

      {cell.isValid === false && cell.errorReason && !cell.isValidating && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2 bottom-2 cursor-help">
                <X className="h-4 w-4 text-brick" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{cell.errorReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default GridCell;
