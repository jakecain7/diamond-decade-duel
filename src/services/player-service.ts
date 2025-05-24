
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Player {
  playerId: string;
  playerName: string;
  careerHR: number;
  debutYear?: number | null;
  finalYear?: number | null;
  teamsPlayedFor?: string[];
}

/**
 * Fetches a random baseball player for the Higher-Lower HR game
 */
export const fetchRandomPlayer = async (excludePlayerId?: string, currentPlayerHR?: number): Promise<Player | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-random-hl-player', {
      body: { 
        excludePlayerId,
        currentPlayerHR
      }
    });

    if (error) {
      console.error('Error fetching random player:', error);
      toast.error('Failed to load player data');
      return null;
    }

    return {
      playerId: data.playerId,
      playerName: data.playerName,
      careerHR: data.careerHR,
      debutYear: data.debutYear,
      finalYear: data.finalYear,
      teamsPlayedFor: data.teamsPlayedFor
    };
  } catch (error) {
    console.error('Exception fetching random player:', error);
    toast.error('Failed to load player data');
    return null;
  }
};
