
import { TeamMapping } from "@/lib/types";

// Mapping of team names to team IDs
export const TEAM_MAPPINGS: TeamMapping = {
  "New York Yankees": "NYA",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHN",
  "Los Angeles Dodgers": "LAN",
  // Add more mappings as needed for your puzzles
};

// Mapping of decade labels to decade start years
export const DECADE_MAPPINGS: { [key: string]: number } = {
  "1970s": 1970,
  "1980s": 1980,
  "1990s": 1990,
  // Add more mappings as needed
};

// Get team ID from row label
export const getTeamIdFromLabel = (label: string): string => {
  return TEAM_MAPPINGS[label] || "";
};

// Get decade start year from column label
export const getDecadeFromLabel = (label: string): number => {
  return DECADE_MAPPINGS[label] || 0;
};
