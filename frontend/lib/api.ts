/**
 * Oriagent Frontend — API Client
 * Kết nối tới FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// ---------- Auth ----------

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
}

export async function apiLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Lỗi kết nối server" }));
    throw new Error(err.detail || "Đăng nhập thất bại");
  }

  return res.json();
}

export function saveToken(token: string) {
  document.cookie = `oriagent_token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
  localStorage.setItem("oriagent_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("oriagent_token");
}

export function removeToken() {
  document.cookie = "oriagent_token=; path=/; max-age=0";
  localStorage.removeItem("oriagent_token");
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
  const token = getToken();
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
  const token = getToken();
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
