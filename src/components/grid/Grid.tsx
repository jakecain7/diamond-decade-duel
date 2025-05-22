
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
    <div>
      {/* Grid header with decade labels */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
        <div className=""></div> {/* Empty cell for top-left corner */}
        <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
          {puzzle.col1_label}
        </div>
        <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
          {puzzle.col2_label}
        </div>
        <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
          {puzzle.col3_label}
        </div>
      </div>

      {/* First row */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
        <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
          <span className="text-[#1d3557] text-center">{puzzle.row1_label}</span>
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
      </div>

      {/* Second row */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2">
        <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
          <span className="text-[#1d3557] text-center">{puzzle.row2_label}</span>
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
