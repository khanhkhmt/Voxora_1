"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      router.push("/studio");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <img src="/oriagent-icon.svg" alt="Oriagent" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold font-headline text-on-surface">
              Oriagent<span className="text-primary">.</span>
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Tạo tài khoản miễn phí để sử dụng Oriagent Studio
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleRegister}
          className="bg-surface rounded-2xl shadow-ambient-lg p-8 ghost-border"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {/* Google Register */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-on-surface bg-surface-container border border-outline-variant/30 flex items-center justify-center gap-2 hover:bg-surface-container-high transition-voxora hover:scale-[1.01] active:scale-[0.99] mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Đăng ký bằng Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-on-surface-variant">hoặc đăng ký bằng email</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-voxora"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-voxora"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-voxora"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-on-primary voxora-gradient shadow-ambient hover:shadow-ambient-lg transition-voxora hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </div>

          {/* Login link */}
          <div className="mt-5 pt-5 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-primary transition-voxora"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
