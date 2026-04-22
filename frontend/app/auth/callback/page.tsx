"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Đang xác thực thông tin đăng nhập...");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Supabase client with PKCE and detectSessionInUrl=true 
    // will AUTOMATICALLY exchange the ?code=... for a session on load.
    // We just need to listen for the SIGNED_IN event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, session ? "Session exists" : "No session");
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || session) {
          setStatus("Đăng nhập thành công! Đang vào Studio...");
          // Short delay to ensure localStorage is flushed
          setTimeout(() => {
            router.replace("/studio");
          }, 500);
        }
      }
    );

    // Immediate check in case the session was already exchanged before this component mounted
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("Đăng nhập thành công! Đang vào Studio...");
        router.replace("/studio");
      } else {
        // If no session yet, let's manually check if there's a code and exchange it
        // This is a fallback if detectSessionInUrl is disabled or delayed
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          setStatus("Đang trao đổi mã xác thực...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Exchange code error:", error);
            setStatus(`Lỗi xác thực: ${error.message}`);
          }
        }
      }
    };

    checkSession();

    // Timeout if nothing happens after 10 seconds
    timeout = setTimeout(() => {
      setStatus("Thời gian xác thực quá lâu. Đang quay lại...");
      setTimeout(() => {
        router.replace("/login?error=auth_timeout");
      }, 2000);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium text-on-surface-variant">{status}</span>
      </div>
    </div>
  );
}
