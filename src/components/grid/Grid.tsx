
import React from "react";
import { PuzzleDefinition } from "@/lib/types";
import GridCell from "@/components/GridCell";

interface GridProps {
  puzzle: PuzzleDefinition;
  gridState: any[][];
  handleCellUpdate: (rowIndex: number, colIndex: number, value: string) => void;
  handleCellBlur: (rowIndex: number, colIndex: number) => void;
}

const Grid = ({ puzzle, gridState, handleCellUpdate, handleCellBlur }: GridProps) => {
  return (
    <div className="relative">
      {/* Grid header with decade labels */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-[1px]">
        <div className=""></div> {/* Empty cell for top-left corner */}
        <div className="bg-brick text-cream p-2 text-center font-semibold rounded-t-lg">
          {puzzle.col1_label}
        </div>
        <div className="bg-brick text-cream p-2 text-center font-semibold rounded-t-lg">
          {puzzle.col2_label}
        </div>
        <div className="bg-brick text-cream p-2 text-center font-semibold rounded-t-lg">
          {puzzle.col3_label}
        </div>
      </div>

      {/* Grid body with team rows */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr] grid-rows-2 gap-[1px] bg-navy rounded-b-lg overflow-hidden">
        {/* First row */}
        <div className="bg-gold p-2 flex items-center justify-center font-semibold h-20 md:h-24">
          <span className="text-navy text-center">{puzzle.row1_label}</span>
        </div>
        {gridState[0].map((cell, colIndex) => (
          <GridCell
            key={`0-${colIndex}`}
            cell={cell}
            rowIndex={0}
            colIndex={colIndex}
            onValueChange={(value) => handleCellUpdate(0, colIndex, value)}
            onBlur={() => handleCellBlur(0, colIndex)}
          />
        ))}

        {/* Second row */}
        <div className="bg-gold p-2 flex items-center justify-center font-semibold h-20 md:h-24">
          <span className="text-navy text-center">{puzzle.row2_label}</span>
        </div>
        {gridState[1].map((cell, colIndex) => (
          <GridCell
            key={`1-${colIndex}`}
            cell={cell}
            rowIndex={1}
            colIndex={colIndex}
            onValueChange={(value) => handleCellUpdate(1, colIndex, value)}
            onBlur={() => handleCellBlur(1, colIndex)}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;
