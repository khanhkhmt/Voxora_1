/**
 * Oriagent Frontend — Supabase Client
 * Browser-side client for authentication (uses localStorage for session)
 */
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      // FALSE: we exchange the code MANUALLY in /auth/callback/page.tsx
      // This prevents the race condition where both auto + manual try to exchange
      detectSessionInUrl: false,
      persistSession: true,
    },
  }
);
