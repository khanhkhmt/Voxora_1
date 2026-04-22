/**
 * Oriagent Frontend — API Client
 * Kết nối tới FastAPI backend, sử dụng Supabase Auth tokens
 */

import { supabase } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// ---------- Token Helper ----------

export async function getToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// ---------- Health ----------

export interface HealthResponse {
  status: string;
  model: string;
  engine: string;
}

export async function apiHealthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

// ---------- Auth / User ----------

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  avatar_url: string;
}

export async function apiGetMe(): Promise<UserProfile> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi xác thực" }));
    throw new Error(err.detail || "Lỗi lấy thông tin user");
  }

  return res.json();
}

// ---------- TTS ----------

export interface TTSParams {
  text: string;
  mode: string;
  control_instruction?: string;
  prompt_text?: string;
  cfg_value?: number;
  normalize?: boolean;
  denoise?: boolean;
  dit_steps?: number;
  reference_audio?: File | null;
}

export async function apiGenerateTTS(params: TTSParams): Promise<Blob> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const formData = new FormData();
  formData.append("text", params.text);
  formData.append("mode", params.mode);
  formData.append("control_instruction", params.control_instruction || "");
  formData.append("prompt_text", params.prompt_text || "");
  formData.append("cfg_value", String(params.cfg_value ?? 2.0));
  formData.append("normalize", String(params.normalize ?? false));
  formData.append("denoise", String(params.denoise ?? false));
  formData.append("dit_steps", String(params.dit_steps ?? 10));

  if (params.reference_audio) {
    formData.append("reference_audio", params.reference_audio);
  }

  const res = await fetch(`${API_BASE}/api/tts/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi tạo audio" }));
    throw new Error(err.detail || `TTS failed (${res.status})`);
  }

  return res.blob();
}

// ---------- ASR ----------

export async function apiTranscribe(audioFile: File): Promise<string> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const formData = new FormData();
  formData.append("audio", audioFile);

  const res = await fetch(`${API_BASE}/api/asr/transcribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Transcribe failed");
  const data = await res.json();
  return data.transcript;
}

// ---------- Admin ----------

export interface ProfileRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function apiGetUsers(): Promise<ProfileRecord[]> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi" }));
    throw new Error(err.detail || "Lỗi lấy danh sách users");
  }

  const data = await res.json();
  return data.users;
}

export async function apiUpdateUserRole(
  userId: string,
  role: string
): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi" }));
    throw new Error(err.detail || "Lỗi cập nhật role");
  }
}

export async function apiDeactivateUser(userId: string): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi" }));
    throw new Error(err.detail || "Lỗi vô hiệu hoá user");
  }
}
