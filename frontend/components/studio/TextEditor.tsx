"use client";

import { useState, useRef, useCallback } from "react";
import { apiGenerateTTS } from "@/lib/api";

interface TextEditorProps {
  activeMode: string;
  referenceAudioFile: File | null;
  promptText: string;
  cfgValue: number;
  normalize: boolean;
  denoise: boolean;
  ditSteps: number;
}

const MODE_CONFIG: Record<string, {
  title: string;
  textPlaceholder: string;
  controlLabel: string;
  controlPlaceholder: string;
  showControl: boolean;
  description: string;
}> = {
  design: {
    title: "Voice Design",
    textPlaceholder: "Nhập văn bản cần chuyển thành giọng nói...\n\nVí dụ: Xin chào, đây là giọng nói được tạo bởi trí tuệ nhân tạo Voxora.",
    controlLabel: "Mô tả giọng nói (Control Instruction)",
    controlPlaceholder: "Mô tả giọng nói mong muốn...\n\nVí dụ: A warm young female voice, gentle and sweet, speaking slowly",
    showControl: true,
    description: "Tạo giọng nói mới từ mô tả bằng chữ. Không cần upload audio.",
  },
  clone: {
    title: "Controllable Cloning",
    textPlaceholder: "Nhập văn bản cần chuyển thành giọng nói (sẽ dùng giọng từ audio mẫu)...",
    controlLabel: "Hướng dẫn điều chỉnh (Control Instruction)",
    controlPlaceholder: "Hướng dẫn điều chỉnh giọng nói...\n\nVí dụ: Speak happily, faster, emphasize important words",
    showControl: true,
    description: "Upload audio mẫu + viết hướng dẫn → AI nhái giọng nhưng điều chỉnh theo ý bạn.",
  },
  ultimate: {
    title: "Ultimate Cloning",
    textPlaceholder: "Nhập văn bản MỚI cần AI đọc bằng giọng đã clone...\n\nVí dụ: Đây là đoạn text mới, AI sẽ đọc bằng giọng y hệt audio mẫu.",
    controlLabel: "",
    controlPlaceholder: "",
    showControl: false,
    description: "Upload audio mẫu + cung cấp transcript → AI nhái giọng siêu chính xác.",
  },
};

export default function TextEditor({
  activeMode,
  referenceAudioFile,
  promptText,
  cfgValue,
  normalize,
  denoise,
  ditSteps,
}: TextEditorProps) {
  const [text, setText] = useState("");
  const [control, setControl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const config = MODE_CONFIG[activeMode] || MODE_CONFIG.design;

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) return;
    setError("");
    setIsGenerating(true);
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      const blob = await apiGenerateTTS({
        text: text.trim(),
        mode: activeMode,
        control_instruction: control.trim(),
        prompt_text: promptText,
        cfg_value: cfgValue,
        normalize,
        denoise,
        dit_steps: ditSteps,
        reference_audio: referenceAudioFile,
      });

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tạo audio");
    } finally {
      setIsGenerating(false);
    }
  }, [text, control, activeMode, promptText, cfgValue, normalize, denoise, ditSteps, referenceAudioFile]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = (format: string) => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = `voxora_${activeMode}_${Date.now()}.${format}`;
    a.click();
  };

  const getFinalTextPreview = () => {
    const t = text.trim();
    const c = control.trim();
    if (activeMode === "design" || activeMode === "clone") {
      return c ? `(${c})${t}` : t;
    }
    return t;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-outline-variant/15 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold font-headline text-on-surface">
            {config.title}
          </h1>
          <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            {config.description}
          </span>
        </div>
        <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          👤 Admin
        </span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-xs text-on-surface-variant leading-relaxed">
            {activeMode === "design" && (
              <><strong className="text-on-surface">Voice Design:</strong> Viết mô tả giọng nói vào ô Control Instruction. AI tạo giọng mới dựa trên mô tả. Format: <code className="bg-surface-container px-1 rounded">(mô tả)văn bản</code></>
            )}
            {activeMode === "clone" && (
              <><strong className="text-on-surface">Controllable Cloning:</strong> Upload audio mẫu bên phải → viết hướng dẫn vào Control Instruction. AI nhái giọng từ <code className="bg-surface-container px-1 rounded">reference_wav</code> và điều chỉnh theo hướng dẫn.</>
            )}
            {activeMode === "ultimate" && (
              <><strong className="text-on-surface">Ultimate Cloning:</strong> Upload audio mẫu + transcript bên phải. AI dùng <code className="bg-surface-container px-1 rounded">prompt_wav</code> + <code className="bg-surface-container px-1 rounded">prompt_text</code> rồi tiếp nối đọc văn bản mới.</>
            )}
          </div>
        </div>

        {/* Main Text Input */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            {activeMode === "ultimate" ? "Văn bản mới (Target Text)" : "Văn bản đầu vào (Target Text)"}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={config.textPlaceholder}
            className="w-full h-36 px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-voxora"
          />
          <div className="flex justify-end mt-1">
            <span className="text-[11px] text-on-surface-variant">{text.length} ký tự</span>
          </div>
        </div>

        {/* Control Instruction */}
        {config.showControl && (
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {config.controlLabel}
            </label>
            <textarea
              value={control}
              onChange={(e) => setControl(e.target.value)}
              placeholder={config.controlPlaceholder}
              className="w-full h-24 px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-voxora"
            />
          </div>
        )}

        {/* VoxCPM Preview */}
        {text.trim() && (activeMode === "design" || activeMode === "clone") && (
          <div className="p-3 rounded-lg bg-surface-container-high/50">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">VoxCPM sẽ nhận:</p>
            <code className="text-xs text-on-surface break-all font-mono">{getFinalTextPreview()}</code>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-on-primary voxora-gradient shadow-ambient hover:shadow-ambient-lg transition-voxora hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang tạo...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>Generate</>
            )}
          </button>

          {(activeMode === "clone" || activeMode === "ultimate") && !referenceAudioFile && (
            <span className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              ⚠️ Cần upload audio mẫu ở bảng bên phải
            </span>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient ghost-border p-5 mt-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full voxora-gradient flex items-center justify-center text-white hover:scale-105 transition-voxora shadow-ambient"
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                )}
              </button>

              {/* Waveform */}
              <div className="flex-1 flex items-center gap-[2px] h-8">
                {Array.from({ length: 80 }).map((_, i) => {
                  const height = Math.sin(i * 0.25) * 30 + 40 + Math.random() * 20;
                  return <div key={i} className="flex-1 rounded-full bg-primary/30" style={{ height: `${height}%` }} />;
                })}
              </div>
            </div>

            {/* Download */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/15">
              <button
                onClick={() => downloadAudio("wav")}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-container transition-voxora"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download WAV
              </button>
              {audioBlob && (
                <span className="ml-auto text-[11px] text-on-surface-variant">
                  {(audioBlob.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
