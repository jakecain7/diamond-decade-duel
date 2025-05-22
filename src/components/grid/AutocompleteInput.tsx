
import React, { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { PlayerSuggestion } from "@/lib/types";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string, playerId?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Type player name...",
  label,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debouncedSearch = useDebounce(inputValue, 300);
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Search for players when input changes
  useEffect(() => {
    const searchPlayers = async () => {
      if (debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.functions.invoke('search-players', {
          body: { searchTerm: debouncedSearch }
        });

        if (error) {
          console.error("Error searching players:", error);
          setError("Failed to search for players");
          setSuggestions([]);
        } else if (data?.players) {
          setSuggestions(data.players);
        }
      } catch (err) {
        console.error("Exception searching players:", err);
        setError("An error occurred while searching");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    searchPlayers();
  }, [debouncedSearch]);

  const handleSelect = (selectedPlayer: PlayerSuggestion) => {
    setInputValue(selectedPlayer.name);
    onChange(selectedPlayer.name, selectedPlayer.id);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Open dropdown if user is typing and has minimum characters
    if (newValue.length >= 2 && !open) {
      setOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full h-full text-center bg-transparent p-2 focus:outline-none ${disabled ? 'text-navy font-semibold' : 'text-navy/90'} text-lg`}
            onFocus={() => value.length >= 2 && setOpen(true)}
            aria-label={label || "Search for players"}
          />
          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-brick" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full max-w-[300px]" align="start">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput placeholder="Search players..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            {loading && (
              <div className="p-4 text-center flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-brick mr-2" />
                <span>Searching...</span>
              </div>
            )}
            {error && <CommandEmpty>Error: {error}</CommandEmpty>}
            {!loading && !error && suggestions.length === 0 && (
              <CommandEmpty>No players found</CommandEmpty>
            )}
            <CommandGroup>
              {suggestions.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  onSelect={() => handleSelect(player)}
                  className="flex justify-between"
                >
                  <div className="text-left">{player.name}</div>
                  {/* Removed years from display */}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AutocompleteInput;
