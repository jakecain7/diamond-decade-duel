
import { useState, useCallback } from "react";
import { GridState, GridCell } from "@/lib/types";

// Hook for managing the grid state
export function useGridState() {
  // Initialize a 2x3 grid with empty cells
  const [gridState, setGridState] = useState<GridState>([
    // First row: 3 cells
    [createEmptyCell(), createEmptyCell(), createEmptyCell()],
    // Second row: 3 cells
    [createEmptyCell(), createEmptyCell(), createEmptyCell()]
  ]);

  // Helper to create an empty grid cell
  function createEmptyCell(): GridCell {
    return {
      value: "",
      isValid: null,
      isValidating: false,
      isLocked: false,
      errorReason: null,
      playerId: null
    };
  }

  // Update a specific cell's value
  const updateCellValue = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setGridState(prevState => {
      const newState = [...prevState];
      newState[rowIndex] = [...newState[rowIndex]];
      newState[rowIndex][colIndex] = {
        ...newState[rowIndex][colIndex],
        value,
        // Reset validation state when user starts typing a new value
        isValid: null,
        errorReason: null,
        playerId: null
      };
      return newState;
    });
  }, []);

  // Set a cell's validation state
  const setCellValidation = useCallback(
    (
      rowIndex: number, 
      colIndex: number, 
      isValid: boolean, 
      isLocked: boolean = false,
      errorReason: string | null = null,
      playerId: string | null = null
    ) => {
      setGridState(prevState => {
        const newState = [...prevState];
        newState[rowIndex] = [...newState[rowIndex]];
        newState[rowIndex][colIndex] = {
          ...newState[rowIndex][colIndex],
          isValid,
          isValidating: false,
          isLocked,
          errorReason,
          playerId
        };
        return newState;
      });
    },
    []
  );

  // Set a cell to validating state (show spinner)
  const setCellValidating = useCallback((rowIndex: number, colIndex: number) => {
    setGridState(prevState => {
      const newState = [...prevState];
      newState[rowIndex] = [...newState[rowIndex]];
      newState[rowIndex][colIndex] = {
        ...newState[rowIndex][colIndex],
        isValidating: true
      };
      return newState;
    });
  }, []);

  // Check if all cells have values
  const isGridComplete = useCallback(() => {
    return gridState.every(row => 
      row.every(cell => cell.value.trim() !== "")
    );
  }, [gridState]);

  // Check if all filled cells are valid
  const areAllFilledCellsValid = useCallback(() => {
    return gridState.every(row => 
      row.every(cell => cell.value.trim() === "" || cell.isValid === true)
    );
  }, [gridState]);

  // Reset the grid
  const resetGrid = useCallback(() => {
    setGridState([
      [createEmptyCell(), createEmptyCell(), createEmptyCell()],
      [createEmptyCell(), createEmptyCell(), createEmptyCell()]
    ]);
  }, []);

  return {
    gridState,
    updateCellValue,
    setCellValidation,
    setCellValidating,
    isGridComplete,
    areAllFilledCellsValid,
    resetGrid
  };
}
