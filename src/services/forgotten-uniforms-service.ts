
import { supabase } from '@/integrations/supabase/client';

export interface ForgottenUniformsQuestion {
  playerName: string;
  playerId: string;
  forgottenTeamId: string;
  forgottenTeamName: string;
  primaryTeamId: string;
  stintSeasons: number;
  stintYears: string;
  choices: Array<{
    id: string;
    name: string;
    isCorrect: boolean;
  }>;
}

export const fetchForgottenUniformsQuestion = async (): Promise<ForgottenUniformsQuestion | null> => {
  try {
    console.log('Fetching forgotten uniforms question...');
    
    const { data, error } = await supabase.functions.invoke('get-forgotten-uniforms-question');
    
    if (error) {
      console.error('Error fetching forgotten uniforms question:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from forgotten uniforms question function');
      return null;
    }
    
    console.log('Successfully fetched forgotten uniforms question:', data);
    return data as ForgottenUniformsQuestion;
  } catch (error) {
    console.error('Error in fetchForgottenUniformsQuestion:', error);
    return null;
  }
};
