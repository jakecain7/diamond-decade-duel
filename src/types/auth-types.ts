
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  hasDisplayName: boolean;
  signInWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
