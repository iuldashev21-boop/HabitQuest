import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Session marker key - exists only while browser tab is open
const SESSION_MARKER = 'habitquest-session-active';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Handle "Remember me" - check if this is a new browser session
    const checkRememberMe = async () => {
      const shouldRemember = localStorage.getItem('habitquest-remember-me') !== 'false';
      const isExistingSession = sessionStorage.getItem(SESSION_MARKER);

      // If remember me is false and this is a new browser session, sign out
      if (!shouldRemember && !isExistingSession) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Sign out properly through Supabase
          await supabase.auth.signOut();
        }
      }

      // Mark this browser session as active
      sessionStorage.setItem(SESSION_MARKER, 'true');
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        // First check remember me status
        await checkRememberMe();

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth session error:', error);
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut
  };
};

export default useAuth;
