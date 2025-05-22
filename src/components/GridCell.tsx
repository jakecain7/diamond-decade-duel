
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { GridCell as GridCellType } from "@/lib/types";

interface GridCellProps {
  cell: GridCellType;
  rowIndex: number;
  colIndex: number;
  onValueChange: (value: string) => void;
  onBlur: () => void;
}

const GridCell = ({ cell, rowIndex, colIndex, onValueChange, onBlur }: GridCellProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`
      border-2 relative 
      ${cell.isLocked ? 'bg-green-50 border-green-500' : 'bg-[#f8edeb] border-[#1d3557]'}
      ${isFocused ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      ${cell.isValid === false ? 'border-red-500' : ''}
      rounded-md p-1 transition-colors
    `}>
      <Input 
        value={cell.value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        disabled={cell.isLocked}
        placeholder="Type player..." 
        className="border-none bg-transparent focus:ring-0 h-10 text-center"
      />
      
      {cell.isValidating && (
        <div className="absolute right-2 top-3">
          <Loader2 className="h-4 w-4 animate-spin text-[#e76f51]" />
        </div>
      )}
      
      {cell.isValid === true && cell.value !== "" && !cell.isValidating && (
        <div className="absolute right-2 top-3">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      )}
    </div>
  );
};

export default GridCell;
