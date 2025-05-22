
import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import AutocompleteInput from "./AutocompleteInput";
import { GridCell } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: GridCell | null;
  position: { row: number; col: number } | null;
  onSelect: (value: string, playerId?: string) => void;
}

const SearchModal = ({ 
  isOpen, 
  onClose, 
  cell, 
  position,
  onSelect 
}: SearchModalProps) => {
  const handleSelect = (value: string, playerId?: string) => {
    onSelect(value, playerId);
    onClose();
  };

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Allow time for modal to render before focusing
      setTimeout(() => {
        const input = document.querySelector('.search-modal-input input') as HTMLInputElement;
        if (input) input.focus();
      }, 50);
    }
  }, [isOpen]);

  // Get category labels for the header
  const getSearchContext = () => {
    if (!position) return "";
    
    const rowCategory = position.row === 0 ? "Row 1" : "Row 2";
    const colCategory = `Column ${position.col + 1}`;
    
    return `${rowCategory} × ${colCategory}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Search Player
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {getSearchContext()}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <AutocompleteInput 
            value={cell?.value || ""}
            onChange={handleSelect}
            disabled={false}
            placeholder="Type player name..."
            className="search-modal-input"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
