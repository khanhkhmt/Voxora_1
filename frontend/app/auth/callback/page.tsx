"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get("code");
    const urlError = params.get("error_description") || params.get("error");

    // Case 1: Supabase returned an error in the URL
    if (urlError) {
      setError(urlError);
      return;
    }

    // Case 2: No code at all — user shouldn't be here
    if (!code) {
      setError("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    // Case 3: Exchange the PKCE code for a session (the ONLY place this happens)
    supabase.auth.exchangeCodeForSession(code).then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      if (data.session) {
        router.replace("/studio");
      }
    });
  }, [router]);

  // --- UI ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="max-w-sm text-center space-y-4 px-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-on-surface">Đăng nhập thất bại</h2>
          <p className="text-sm text-on-surface-variant break-all">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-primary voxora-gradient"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-on-surface-variant">Đang đăng nhập...</span>
      </div>
    </div>
  );
}
