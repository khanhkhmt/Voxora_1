"use client";

import { useRouter } from "next/navigation";

interface SidebarProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

const NAV_ITEMS = [
  { id: "design", icon: "🎨", label: "Voice Design" },
  { id: "clone", icon: "🎛️", label: "Voice Cloning" },
  { id: "ultimate", icon: "🎙️", label: "Ultimate Clone" },
];

const COMING_SOON = [
  { icon: "🧪", label: "Voice Lab" },
  { icon: "📁", label: "My Projects" },
];

export default function Sidebar({ activeMode, onModeChange }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "voxora_token=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/15 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-outline-variant/15">
        <div className="flex items-center gap-2">
          <img src="/oriagent-icon.svg" alt="Oriagent" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-bold tracking-tight font-headline text-on-surface">
            Oriagent<span className="text-primary">.</span> <span className="text-xs font-normal text-on-surface-variant">Studio</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
          Tạo giọng nói
        </p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-voxora ${
              activeMode === item.id
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
            {activeMode === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}

        <div className="my-4 border-t border-outline-variant/15" />

        <p className="px-3 mb-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
          Nâng cao
        </p>
        {COMING_SOON.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant/40 cursor-not-allowed"
          >
            <span className="text-base opacity-40">{item.icon}</span>
            {item.label}
            <span className="ml-auto text-[9px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-medium">
              Soon
            </span>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-outline-variant/15">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">Admin</p>
            <p className="text-[11px] text-on-surface-variant">Unlimited access</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-voxora"
            title="Đăng xuất"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
