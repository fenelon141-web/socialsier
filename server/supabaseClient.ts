import { createClient } from "@supabase/supabase-js";

// ✅ Use your project details
export const SUPABASE_URL = "https://pjociaiucneerhcsqduy.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb2NpYWl1Y25lZXJoY3NxZHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzUxNDcsImV4cCI6MjA3MDc1MTE0N30.qB2TbVORd8lVjz_E11ZWPiYnacZbadjiW6PvUBa0CTs";

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

