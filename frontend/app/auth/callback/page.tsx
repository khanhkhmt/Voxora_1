"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth callback page — exchanges the auth code for a session
 * on the CLIENT side so tokens are stored in localStorage
 * (consistent with the browser Supabase client).
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get("code");

        if (code) {
          // Exchange the OAuth code for a session (PKCE flow)
          // This uses the code_verifier stored in localStorage by signInWithOAuth
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            router.push("/studio");
            return;
          }
          console.error("Auth callback error:", error.message);
        }

        // Fallback: check if session already exists (e.g. implicit flow)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.push("/studio");
        } else {
          router.push("/login?error=auth_callback_failed");
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        router.push("/login?error=auth_callback_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex items-center gap-3">
        <svg
          className="animate-spin w-5 h-5 text-primary"
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
        <span className="text-sm text-on-surface-variant">
          Đang xử lý đăng nhập...
        </span>
      </div>
    </div>
  );
}
