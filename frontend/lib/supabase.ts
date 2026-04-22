/**
 * Oriagent Frontend — Supabase Client
 * Browser-side client for authentication (uses localStorage for session)
 */
import { createClient } from "@supabase/supabase-js";

// Standard client for browser - stores session in localStorage
// PKCE flow is the standard and required by Supabase for secure auth
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);
