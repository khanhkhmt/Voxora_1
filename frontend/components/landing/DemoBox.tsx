"use client";

import { useState, useRef } from "react";

interface AudioSample {
  id: string;
  label: string;
  language: string;
  description: string;
  text: string;
  emoji: string;
}

const DEMO_SAMPLES: AudioSample[] = [
  {
    id: "warm-female-vi",
    label: "Warm Female",
    language: "Vietnamese",
    description: "Giọng nữ ấm áp, nhẹ nhàng",
    text: "Xin chào, chào mừng bạn đến với Oriagent — nền tảng tạo giọng nói AI hàng đầu.",
    emoji: "🇻🇳",
  },
  {
    id: "deep-male-en",
    label: "Deep Male",
    language: "English",
    description: "A deep, authoritative male voice",
    text: "The morning sun painted the sky in shades of amber and rose, heralding a new day full of possibilities.",
    emoji: "🇺🇸",
  },
  {
    id: "young-energetic-jp",
    label: "Young Energetic",
    language: "Japanese",
    description: "若くて元気な声",
    text: "こんにちは！ボクソラへようこそ。AIで自然な音声を生成しましょう。",
    emoji: "🇯🇵",
  },
];

export default function DemoBox() {
  const [activeId, setActiveId] = useState(DEMO_SAMPLES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeSample = DEMO_SAMPLES.find((s) => s.id === activeId)!;

  const handlePlay = () => {
    // Mock: simulate playing for 3 seconds
    setIsPlaying(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            🎧 Trải nghiệm Oriagent
          </h2>
          <p className="mt-3 text-on-surface-variant text-lg">
            Nghe thử giọng nói AI được tạo bởi VoxCPM2
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-ambient-lg ghost-border overflow-hidden">
          {/* Sample Tabs */}
          <div className="flex border-b border-outline-variant/20">
            {DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setActiveId(sample.id);
                  setIsPlaying(false);
                }}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-voxora relative ${
                  activeId === sample.id
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="mr-1.5">{sample.emoji}</span>
                <span className="hidden sm:inline">{sample.label}</span>
                <span className="sm:hidden">{sample.language}</span>
                {activeId === sample.id && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t-full voxora-gradient" />
                )}
              </button>
            ))}
          </div>

          {/* Player Content */}
          <div className="p-6 md:p-8">
            {/* Voice info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full voxora-gradient flex items-center justify-center text-white text-lg">
                {activeSample.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{activeSample.label}</p>
                <p className="text-xs text-on-surface-variant">{activeSample.description}</p>
              </div>
            </div>

            {/* Text preview */}
            <div className="bg-surface-container rounded-xl p-4 mb-6">
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                &ldquo;{activeSample.text}&rdquo;
              </p>
            </div>

            {/* Waveform Mockup */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-voxora shadow-ambient ${
                  isPlaying
                    ? "bg-secondary text-on-secondary scale-95"
                    : "voxora-gradient text-on-primary hover:scale-105 hover:shadow-ambient-lg"
                }`}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                )}
              </button>

              {/* Waveform bars */}
              <div className="flex-1 flex items-center gap-[2px] h-10">
                {Array.from({ length: 60 }).map((_, i) => {
                  const height = Math.sin(i * 0.3) * 30 + 35 + Math.random() * 15;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPlaying && i < 30
                          ? "bg-primary"
                          : "bg-outline-variant/30"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              <span className="text-xs text-on-surface-variant font-mono tabular-nums">
                {isPlaying ? "0:01" : "0:03"}
              </span>
            </div>
          </div>

          {/* Lock Banner */}
          <div className="bg-surface-container px-6 py-3.5 flex items-center justify-between border-t border-outline-variant/15">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Đăng nhập để tạo giọng nói của riêng bạn
            </div>
            <a
              href="/login"
              className="text-xs font-semibold text-primary hover:text-primary-container transition-voxora"
            >
              Đăng nhập →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
