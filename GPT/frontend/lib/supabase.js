/**
 * Supabase Client Configuration
 * 
 * This creates a Supabase client for direct database access if needed.
 * For most operations, you'll use the backend API instead.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Direct database access will not work.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,    // Keep user logged in
        autoRefreshToken: true,  // Auto-refresh auth tokens
        detectSessionInUrl: true, // Handle OAuth redirects
      },
    })
  : null;

/**
 * Optional: Helper functions for direct Supabase operations
 * (Usually you'll use backend API instead)
 */

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Get current session (if using Supabase Auth directly)
export const getCurrentSession = async () => {
  if (!supabase) return null;
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Sign out (if using Supabase Auth directly)
export const signOut = async () => {
  if (!supabase) return;
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export default supabase;
