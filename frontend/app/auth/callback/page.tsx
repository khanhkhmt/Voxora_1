"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth callback page — handles implicit flow.
 * After Google OAuth, Supabase redirects here with tokens in URL hash:
 *   /auth/callback#access_token=xxx&refresh_token=yyy&...
 * The Supabase client auto-detects the hash and stores the session.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Đang xử lý đăng nhập...");

  useEffect(() => {
    // Listen for auth state change — Supabase auto-detects tokens from URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session) {
            setStatus("Đăng nhập thành công! Đang chuyển hướng...");
            router.replace("/studio");
          }
        }
      }
    );

    // Also check if session already exists (immediate check)
    const checkSession = async () => {
      // Small delay to let Supabase process URL hash
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("Đăng nhập thành công! Đang chuyển hướng...");
        router.replace("/studio");
        return;
      }

      // Also try PKCE code exchange as fallback
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setStatus("Đăng nhập thành công! Đang chuyển hướng...");
          router.replace("/studio");
          return;
        }
      }
    };

    checkSession();

    // Timeout after 10 seconds — redirect to login
    const timeout = setTimeout(() => {
      setStatus("Đăng nhập thất bại. Đang chuyển về...");
      setTimeout(() => router.replace("/login?error=auth_timeout"), 1500);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-6 h-6 text-primary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm text-on-surface-variant">{status}</span>
      </div>
    </div>
  );
}
