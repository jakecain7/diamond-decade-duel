
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ASGPlayer {
  playerId: string;
  playerName: string;
  totalASG: number;
}

/**
 * Fetches a random baseball player with All-Star Game appearances
 */
export const fetchRandomASGPlayer = async (excludePlayerId?: string): Promise<ASGPlayer | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-random-asg-player', {
      body: { excludePlayerId }
    });

    if (error) {
      console.error('Error fetching random ASG player:', error);
      toast.error('Failed to load player data');
      return null;
    }

    return {
      playerId: data.playerId,
      playerName: data.playerName,
      totalASG: data.totalASG
    };
  } catch (error) {
    console.error('Exception fetching random ASG player:', error);
    toast.error('Failed to load player data');
    return null;
  }
};
