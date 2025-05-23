
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fetch the personal best score for a user in a specific game
 */
export const fetchPersonalBestScore = async (gameSlug: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-user-game-score', {
      body: { gameSlug }
    });

    if (error) {
      console.error('Error fetching personal best score:', error);
      return null;
    }

    if (data && typeof data.highScore === 'number') {
      return data.highScore;
    }
    
    return null;
  } catch (error) {
    console.error('Exception fetching personal best score:', error);
    return null;
  }
};

/**
 * Submit a user's score for a game and check if it's a new high score
 */
export const submitScore = async (gameSlug: string, finalScore: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('submit-hl-score', {
      body: { gameSlug, score: finalScore }
    });

    if (error) {
      console.error('Error submitting score:', error);
      return { isNewHighScore: false };
    }

    if (data?.isNewHighScore) {
      toast.success(`New personal best: ${data.highScore}!`);
      return { 
        isNewHighScore: true,
        highScore: data.highScore 
      };
    }
    
    return { isNewHighScore: false };
  } catch (error) {
    console.error('Exception submitting score:', error);
    return { isNewHighScore: false };
  }
};
