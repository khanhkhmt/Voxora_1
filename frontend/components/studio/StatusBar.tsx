"use client";

import { useState, useEffect } from "react";
import { apiHealthCheck } from "@/lib/api";

type HealthStatus = "loading" | "ready" | "offline" | "error";

export default function StatusBar() {
  const [status, setStatus] = useState<HealthStatus>("loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      const data = await apiHealthCheck();
      if (data.status === "ready") {
        setStatus("ready");
        setDetail("VoxCPM2 · GPU Available");
      } else {
        setStatus("offline");
        setDetail("VoxCPM offline — chạy Kaggle notebook");
      }
    } catch {
      setStatus("error");
      setDetail("Backend chưa khởi động");
    }
  }

  const config: Record<HealthStatus, { dot: string; bg: string }> = {
    loading: { dot: "bg-amber-400 animate-pulse", bg: "bg-surface-container-lowest" },
    ready: { dot: "bg-emerald-500", bg: "bg-surface-container-lowest" },
    offline: { dot: "bg-amber-500 animate-pulse", bg: "bg-amber-50/50" },
    error: { dot: "bg-red-500", bg: "bg-red-50/50" },
  };

  const c = config[status];

  return (
    <div className={`flex items-center justify-between px-5 py-2 border-t border-outline-variant/15 ${c.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className="text-[11px] text-on-surface-variant">
          {status === "loading" ? "Đang kiểm tra..." : detail}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={checkHealth}
          className="text-[11px] text-on-surface-variant hover:text-primary transition-voxora"
          title="Refresh health check"
        >
          🔄
        </button>
        <span className="text-[11px] text-on-surface-variant/60">v1.0.0</span>
      </div>
    </div>
  );
}
