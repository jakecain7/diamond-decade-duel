
import { TeamMapping } from "@/lib/types";

// Mapping of team names to team IDs
export const TEAM_MAPPINGS: TeamMapping = {
  "New York Yankees": "NYA",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHN",
  "Los Angeles Dodgers": "LAN",
  "San Francisco Giants": "SFN",
  "Atlanta Braves": "ATL",
  "St. Louis Cardinals": "SLN",
  "Philadelphia Phillies": "PHI",
  "Chicago White Sox": "CHA",
  "Cincinnati Reds": "CIN",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Oakland Athletics": "OAK",
  "Toronto Blue Jays": "TOR",
  "Cleveland Guardians": "CLE", // Formerly Indians
  "Minnesota Twins": "MIN",
  "New York Mets": "NYN",
  "Pittsburgh Pirates": "PIT"
  // Add more mappings as needed for your puzzles
};

// Mapping of decade labels to decade start years
export const DECADE_MAPPINGS: { [key: string]: number } = {
  "1970s": 1970,
  "1980s": 1980,
  "1990s": 1990,
  "2000s": 2000,
  "2010s": 2010,
  "2020s": 2020
  // Add more mappings as needed
};

// Get team ID from row label
export const getTeamIdFromLabel = (label: string): string => {
  const teamId = TEAM_MAPPINGS[label];
  if (!teamId) {
    console.error(`Team mapping not found for: "${label}". Please add it to TEAM_MAPPINGS in gridUtils.ts`);
  }
  return teamId || "";
};

// Get decade start year from column label
export const getDecadeFromLabel = (label: string): number => {
  const decade = DECADE_MAPPINGS[label];
  if (!decade) {
    console.error(`Decade mapping not found for: "${label}". Please add it to DECADE_MAPPINGS in gridUtils.ts`);
  }
  return decade || 0;
};
