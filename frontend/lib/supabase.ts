/**
 * Oriagent Frontend — Supabase Client
 * Browser-side client for authentication (uses localStorage for session)
 */
import { createClient } from "@supabase/supabase-js";

// Standard client for browser - stores session in localStorage (reliable)
// Explicitly set PKCE flow for secure OAuth handling
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
