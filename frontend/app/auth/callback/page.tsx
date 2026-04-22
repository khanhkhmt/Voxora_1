"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Đang xác thực thông tin đăng nhập...");
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    let isMounted = true;

    const performAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        const error_description = url.searchParams.get("error_description");

        // 1. Check if Supabase passed an error directly in the URL
        if (error) {
          setErrorDetails(`URL Error: ${error_description || error}`);
          return;
        }

        // 2. Explicitly exchange code to see the EXACT error if it fails
        if (code) {
          setStatus("Tìm thấy mã xác thực, đang xử lý...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setErrorDetails(`Exchange Error: ${exchangeError.message}`);
            return;
          }

          if (data.session && isMounted) {
            setStatus("Đăng nhập thành công! Đang vào Studio...");
            router.replace("/studio");
            return;
          }
        }

        // 3. Fallback: Check if session already exists
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setErrorDetails(`Session Error: ${sessionError.message}`);
          return;
        }

        if (session && isMounted) {
          setStatus("Đăng nhập thành công! Đang vào Studio...");
          router.replace("/studio");
          return;
        }

        // 4. If no code and no session, we shouldn't be here
        if (!code && !session) {
          setErrorDetails("Không tìm thấy phiên đăng nhập hoặc mã xác thực trên URL.");
        }

      } catch (err: any) {
        setErrorDetails(`Ngoại lệ: ${err.message}`);
      }
    };

    performAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
        {!errorDetails ? (
          <>
            <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-on-surface-variant">{status}</span>
          </>
        ) : (
          <>
            <div className="p-4 bg-error/10 rounded-2xl border border-error/20">
              <svg className="w-8 h-8 text-error mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-error font-bold mb-2">Đăng nhập thất bại</h3>
              <p className="text-sm text-on-surface-variant break-all">{errorDetails}</p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-medium"
            >
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
}
