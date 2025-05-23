import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  hasDisplayName: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Exception when fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Add user to Beehiiv newsletter
  const addUserToBeehiiv = async (email: string) => {
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

  // Refresh user profile
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let previousEmail: string | null = null;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          const userEmail = currentSession?.user?.email;
          const userId = currentSession?.user?.id;
          
          // Removed toast notification for SIGNED_IN event
          
          // Only add to Beehiiv if this is a different email than the last one
          // This prevents duplicate calls when refreshing the page
          if (userEmail && userEmail !== previousEmail) {
            previousEmail = userEmail;
            
            // Using setTimeout to avoid blocking the auth flow
            // and to prevent potential Supabase auth deadlocks
            setTimeout(() => {
              addUserToBeehiiv(userEmail);
            }, 0);
          }

          // Fetch user profile if we have a user ID
          if (userId) {
            setTimeout(() => {
              fetchUserProfile(userId);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
          previousEmail = null;
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user?.id) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setProfileLoading(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect to the dedicated auth callback route
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading: loading || profileLoading,
    hasDisplayName: !!profile?.display_name,
    signInWithEmail,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
