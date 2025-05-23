
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addUserToBeehiiv } from '@/utils/beehiiv';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { AuthContextType, Profile } from '@/types/auth-types';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Hooks
  const { toast } = useToast();
  const { signInWithEmail, signOut, fetchUserProfile } = useAuthOperations();
  
  // Refresh user profile
  const refreshProfile = async () => {
    if (user?.id) {
      setProfileLoading(true);
      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setProfile(profileData as Profile);
      }
      setProfileLoading(false);
    }
  };

  // Auth state management
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
              fetchUserProfile(userId).then(data => {
                if (data) {
                  setProfile(data as Profile);
                }
                setProfileLoading(false);
              });
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
        fetchUserProfile(currentSession.user.id).then(data => {
          if (data) {
            setProfile(data as Profile);
          }
          setProfileLoading(false);
        });
      } else {
        setProfileLoading(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Context value
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
