"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { apiGetMe, apiGetUsers, UserProfile, ProfileRecord } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const me = await apiGetMe();
        if (me.role !== "admin") {
          router.push("/studio");
          return;
        }
        setUser(me);

        const allUsers = await apiGetUsers();
        setUsers(allUsers);
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-on-surface-variant">Đang tải Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <Link href="/studio" className="text-primary hover:underline">
            Quay lại Studio
          </Link>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant/15 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/studio" className="flex items-center gap-2 group">
              <img src="/oriagent-icon.svg" alt="Oriagent" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold tracking-tight font-headline text-on-surface">
                Oriagent<span className="text-primary">.</span>
              </span>
            </Link>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="text-sm text-on-surface-variant hover:text-primary transition-voxora"
            >
              ← Quay lại Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Quản lý người dùng và hệ thống Oriagent
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface rounded-2xl p-6 ghost-border">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Tổng người dùng
            </p>
            <p className="text-3xl font-bold text-on-surface font-headline">{totalUsers}</p>
          </div>
          <div className="bg-surface rounded-2xl p-6 ghost-border">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Đang hoạt động
            </p>
            <p className="text-3xl font-bold text-green-400 font-headline">{activeUsers}</p>
          </div>
          <div className="bg-surface rounded-2xl p-6 ghost-border">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Quản trị viên
            </p>
            <p className="text-3xl font-bold text-primary font-headline">{adminCount}</p>
          </div>
        </div>

        {/* Users link */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-on-primary voxora-gradient shadow-ambient hover:shadow-ambient-lg transition-voxora hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Quản lý người dùng
        </Link>
      </main>
    </div>
  );
}
