/**
 * Oriagent Frontend — Supabase Client
 * Browser-side client for authentication
 */
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client components
export const supabase = createSupabaseClient();
