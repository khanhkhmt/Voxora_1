"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  apiGetMe,
  apiGetUsers,
  apiUpdateUserRole,
  apiDeactivateUser,
  UserProfile,
  ProfileRecord,
} from "@/lib/api";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
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
      setCurrentUser(me);

      const allUsers = await apiGetUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      await apiUpdateUserRole(userId, newRole);
      setSuccess(`Đã đổi role thành "${newRole}"`);
      // Refresh data
      const allUsers = await apiGetUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (userId: string, email: string) => {
    if (!confirm(`Bạn có chắc muốn vô hiệu hoá tài khoản ${email}?`)) return;

    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      await apiDeactivateUser(userId);
      setSuccess(`Đã vô hiệu hoá tài khoản ${email}`);
      const allUsers = await apiGetUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || "Lỗi vô hiệu hoá");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-on-surface-variant">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant/15 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              <img src="/oriagent-icon.svg" alt="Oriagent" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold tracking-tight font-headline text-on-surface">
                Oriagent<span className="text-primary">.</span>
              </span>
            </Link>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
              Admin
            </span>
            <span className="text-on-surface-variant">/</span>
            <span className="text-sm text-on-surface font-medium">Users</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-on-surface-variant hover:text-primary transition-voxora"
            >
              ← Dashboard
            </Link>
            <Link
              href="/studio"
              className="text-sm text-on-surface-variant hover:text-primary transition-voxora"
            >
              Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">
          Quản lý người dùng
        </h1>
        <p className="text-sm text-on-surface-variant mb-6">
          {users.length} người dùng trong hệ thống
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 text-green-400 text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-surface rounded-2xl ghost-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentUser = u.id === currentUser?.id;
                  const initial = u.full_name
                    ? u.full_name.charAt(0).toUpperCase()
                    : u.email.charAt(0).toUpperCase();
                  const displayName = u.full_name || u.email.split("@")[0];

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
                    >
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                              {initial}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-on-surface">{displayName}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              Bạn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {u.role === "admin" ? "👑 Admin" : "👤 User"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-on-surface-variant">
                        {new Date(u.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            u.is_active ? "text-green-400" : "text-error"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.is_active ? "bg-green-400" : "bg-error"
                            }`}
                          />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isCurrentUser ? (
                          <span className="text-xs text-on-surface-variant">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle role */}
                            <button
                              onClick={() =>
                                handleRoleChange(
                                  u.id,
                                  u.role === "admin" ? "user" : "admin"
                                )
                              }
                              disabled={actionLoading === u.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-voxora disabled:opacity-50"
                            >
                              {actionLoading === u.id
                                ? "..."
                                : u.role === "admin"
                                ? "→ User"
                                : "→ Admin"}
                            </button>

                            {/* Deactivate */}
                            {u.is_active && (
                              <button
                                onClick={() => handleDeactivate(u.id, u.email)}
                                disabled={actionLoading === u.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error hover:bg-error/20 transition-voxora disabled:opacity-50"
                              >
                                {actionLoading === u.id ? "..." : "Vô hiệu hoá"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              Chưa có người dùng nào trong hệ thống.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
