
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ComboPlayer {
  playerId: string;
  playerName: string;
  careerHR: number;
  careerSB: number;
  comboTotal: number;
  debutYear?: number | null;
  finalYear?: number | null;
  teamsPlayedFor?: string[];
}

/**
 * Fetches a random baseball player for the Bag 'n Bomb Battle game
 */
export const fetchRandomComboPlayer = async (excludePlayerId?: string, currentComboTotal?: number): Promise<ComboPlayer | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-random-combo-player', {
      body: { 
        excludePlayerId,
        currentComboTotal
      }
    });

    if (error) {
      console.error('Error fetching random combo player:', error);
      toast.error('Failed to load player data');
      return null;
    }

    return {
      playerId: data.playerId,
      playerName: data.playerName,
      careerHR: data.careerHR,
      careerSB: data.careerSB,
      comboTotal: data.comboTotal,
      debutYear: data.debutYear,
      finalYear: data.finalYear,
      teamsPlayedFor: data.teamsPlayedFor
    };
  } catch (error) {
    console.error('Exception fetching random combo player:', error);
    toast.error('Failed to load player data');
    return null;
  }
};
