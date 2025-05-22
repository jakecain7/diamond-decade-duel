
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PlayerSuggestion {
  id: string;
  name: string;
  similarity: number;
}

interface PlayerSuggestionsProps {
  suggestions: PlayerSuggestion[];
  onSelectSuggestion: (suggestion: PlayerSuggestion) => void;
  onDismiss: () => void;
  loading?: boolean;
}

const PlayerSuggestions = ({
  suggestions,
  onSelectSuggestion,
  onDismiss,
  loading = false
}: PlayerSuggestionsProps) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-navy/20 rounded-md shadow-lg p-3 z-50">
        <div className="text-sm text-navy/70">Loading suggestions...</div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-navy/20 rounded-md shadow-lg p-3 z-50">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-navy/70">Did you mean:</div>
        <button 
          onClick={onDismiss}
          className="text-navy/50 hover:text-navy"
          aria-label="Dismiss suggestions"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            className="justify-start text-left font-normal hover:bg-cream/50"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PlayerSuggestions;
