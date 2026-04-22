"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth callback page — handles both PKCE and implicit flows.
 * After Google/OAuth login, Supabase redirects here with either:
 * - ?code=xxx (PKCE flow) → needs exchangeCodeForSession
 * - #access_token=xxx (implicit flow) → auto-detected by client
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Đang xử lý đăng nhập...");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let unsubscribe: (() => void) | null = null;

    const handleCallback = async () => {
      try {
        // 1) Try PKCE flow: exchange code from URL query params
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          setStatus("Đang xác thực...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error && data.session) {
            setStatus("Đăng nhập thành công! Đang chuyển hướng...");
            router.replace("/studio");
            return;
          }

          if (error) {
            console.error("PKCE exchange failed:", error.message);
            // Don't return - fall through to other methods
          }
        }

        // 2) Check if session already exists (implicit flow or already authenticated)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("Đăng nhập thành công! Đang chuyển hướng...");
          router.replace("/studio");
          return;
        }

        // 3) Listen for auth state change (handles hash fragment processing)
        setStatus("Đang chờ xác thực...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (session) {
              subscription.unsubscribe();
              setStatus("Đăng nhập thành công! Đang chuyển hướng...");
              router.replace("/studio");
            }
          }
        );
        unsubscribe = () => subscription.unsubscribe();

        // 4) Timeout after 15 seconds
        timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          setStatus("Đăng nhập thất bại. Đang chuyển về trang đăng nhập...");
          setTimeout(() => router.replace("/login?error=auth_timeout"), 2000);
        }, 15000);

      } catch (err) {
        console.error("Auth callback exception:", err);
        setStatus("Có lỗi xảy ra. Đang chuyển về trang đăng nhập...");
        setTimeout(() => router.replace("/login?error=auth_callback_failed"), 2000);
      }
    };

    handleCallback();

    return () => {
      if (timeout) clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
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
