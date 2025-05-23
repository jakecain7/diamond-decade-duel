
import { supabase } from '@/integrations/supabase/client';

/**
 * Adds a user to the Beehiiv newsletter
 * @param email User's email address
 */
export const addUserToBeehiiv = async (email: string): Promise<void> => {
  try {
    console.log('Adding user to Beehiiv newsletter:', email);
    
    const { data, error } = await supabase.functions.invoke('add-user-to-beehiiv', {
      body: { email }
    });
    
    if (error) {
      console.error('Error adding user to Beehiiv:', error);
      return;
    }
    
    console.log('Successfully added user to Beehiiv:', data);
  } catch (error) {
    console.error('Exception when adding user to Beehiiv:', error);
  }
};
