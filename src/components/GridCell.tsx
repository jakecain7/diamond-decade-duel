
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2 } from "lucide-react";
import { GridCell as GridCellType } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PlayerSuggestions from "./grid/PlayerSuggestions";
import { supabase } from "@/integrations/supabase/client";

interface PlayerSuggestion {
  id: string;
  name: string;
  similarity: number;
}

interface GridCellProps {
  cell: GridCellType;
  rowIndex: number;
  colIndex: number;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  onSuggestionSelect?: (suggestion: PlayerSuggestion) => void;
}

const GridCell = ({ 
  cell, 
  rowIndex, 
  colIndex, 
  onValueChange, 
  onBlur,
  onSuggestionSelect 
}: GridCellProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  // Fetch suggestions if player not found
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cell.isValid === false && 
          cell.errorReason?.includes("Player not found") && 
          cell.value && 
          !cell.isValidating) {
        
        setLoadingSuggestions(true);
        try {
          const { data, error } = await supabase.functions.invoke('suggest-player-correction', {
            body: { typedName: cell.value }
          });
          
          if (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
          } else if (data?.suggestions) {
            setSuggestions(data.suggestions);
          }
        } catch (err) {
          console.error('Failed to fetch suggestions:', err);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        // Clear suggestions when cell state changes
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [cell.isValid, cell.errorReason, cell.value, cell.isValidating]);

  const handleSuggestionSelect = (suggestion: PlayerSuggestion) => {
    onValueChange(suggestion.name);
    setSuggestions([]);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    // Automatically validate after selecting a suggestion
    setTimeout(() => {
      onBlur();
    }, 100);
  };

  const dismissSuggestions = () => {
    setSuggestions([]);
  };

  return (
    <div className={`
      relative h-20 md:h-24 
      ${cell.isLocked ? 'bg-gold/90' : 'bg-cream/95 hover:bg-cream'}
      ${isShaking ? 'animate-shake' : ''}
      ${cell.isValid === false ? 'bg-cream/95' : ''}
      shadow-inner transition-colors
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
        className={`
          w-full h-full border-none focus:outline-none 
          text-center ${cell.isLocked ? 'text-navy font-semibold' : 'text-navy/90'} 
          text-lg bg-transparent`}
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

      {/* Player suggestions component */}
      {(suggestions.length > 0 || loadingSuggestions) && (
        <PlayerSuggestions 
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
          onDismiss={dismissSuggestions}
          loading={loadingSuggestions}
        />
      )}
    </div>
  );
};

export default GridCell;
