import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Make sure these are set in your environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://pjociaiucneerhcsqduy.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY is missing in your environment variables");
}

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Signup a user with email and password
 */
export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Login a user with email and password
 */
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Get current user session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Logout current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}
