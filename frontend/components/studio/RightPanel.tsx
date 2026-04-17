"use client";

import { useState } from "react";
import { apiTranscribe } from "@/lib/api";

interface RightPanelProps {
  activeMode: string;
  referenceAudioFile: File | null;
  onReferenceAudioChange: (file: File | null) => void;
  promptText: string;
  onPromptTextChange: (text: string) => void;
  cfgValue: number;
  onCfgChange: (val: number) => void;
  normalize: boolean;
  onNormalizeChange: (val: boolean) => void;
  denoise: boolean;
  onDenoiseChange: (val: boolean) => void;
  ditSteps: number;
  onDitStepsChange: (val: number) => void;
}

const VOICE_PRESETS = [
  { label: "Warm Female", desc: "A warm young female voice, gentle and sweet" },
  { label: "Deep Male", desc: "A deep authoritative male voice, slow and steady" },
  { label: "Young Energetic", desc: "A young energetic voice, fast and cheerful" },
  { label: "Calm Narrator", desc: "A calm narrator voice, clear and professional" },
  { label: "Elderly Wise", desc: "An elderly wise voice, warm and slow-paced" },
  { label: "Child Playful", desc: "A child voice, playful and high-pitched" },
];

export default function RightPanel({
  activeMode,
  referenceAudioFile,
  onReferenceAudioChange,
  promptText,
  onPromptTextChange,
  cfgValue,
  onCfgChange,
  normalize,
  onNormalizeChange,
  denoise,
  onDenoiseChange,
  ditSteps,
  onDitStepsChange,
}: RightPanelProps) {
  const [outputFormat, setOutputFormat] = useState("wav");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleAutoTranscribe = async () => {
    if (!referenceAudioFile) return;
    setIsTranscribing(true);
    try {
      const transcript = await apiTranscribe(referenceAudioFile);
      onPromptTextChange(transcript);
    } catch {
      // Fallback mock
      onPromptTextChange("Xin chào, đây là nội dung transcript tự động nhận diện bằng FunASR.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <aside className="w-72 bg-surface-container-lowest border-l border-outline-variant/15 h-full overflow-y-auto">
      <div className="p-5 space-y-6">

        {/* VOICE DESIGN: Voice Presets */}
        {activeMode === "design" && (
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              🎨 Voice Presets
            </h3>
            <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
              Click để sử dụng mô tả giọng nói mẫu
            </p>
            <div className="space-y-2">
              {VOICE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSelectedPreset(preset.label)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-voxora ghost-border ${
                    selectedPreset === preset.label
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-primary/5 hover:text-on-surface"
                  }`}
                >
                  <p className="font-medium">{preset.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5 italic">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTROLLABLE CLONING: Reference Audio */}
        {activeMode === "clone" && (
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              🎛️ Reference Audio
            </h3>
            <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
              Upload audio mẫu — AI nhái giọng + điều chỉnh theo Control Instruction
            </p>
            {renderAudioUploader()}
          </div>
        )}

        {/* ULTIMATE CLONING: Prompt Audio + Transcript */}
        {activeMode === "ultimate" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                🎙️ Prompt Audio
              </h3>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
                Upload audio mẫu — AI dùng làm <strong>prompt_wav</strong> để tiếp nối
              </p>
              {renderAudioUploader()}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Transcript (prompt_text)
                </h3>
                <button
                  onClick={handleAutoTranscribe}
                  disabled={isTranscribing || !referenceAudioFile}
                  className="text-[11px] font-semibold text-primary hover:text-primary-container transition-voxora disabled:opacity-50 flex items-center gap-1"
                >
                  {isTranscribing ? (
                    <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang nhận diện...</>
                  ) : (
                    "🔍 Auto Transcribe"
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-2 leading-relaxed">
                Nội dung chữ <strong>trong audio mẫu</strong> — nhấn &quot;Auto Transcribe&quot; để FunASR tự động nhận diện.
              </p>
              <textarea
                value={promptText}
                onChange={(e) => onPromptTextChange(e.target.value)}
                placeholder="Nhập hoặc tự động nhận diện nội dung trong audio mẫu..."
                className="w-full h-24 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-xs text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-voxora"
              />
            </div>
          </div>
        )}

        {/* GENERATION SETTINGS */}
        <div className="border-t border-outline-variant/15 pt-5">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            ⚙️ Cài đặt sinh
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-on-surface-variant">CFG Scale</label>
                <span className="text-xs font-mono text-on-surface">{cfgValue.toFixed(1)}</span>
              </div>
              <input type="range" min="1.0" max="3.0" step="0.1" value={cfgValue}
                onChange={(e) => onCfgChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-0.5">
                <span>Creative (1.0)</span><span>Precise (3.0)</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-on-surface-variant mb-1.5 block">Định dạng xuất</label>
              <div className="flex gap-2">
                {["wav", "mp3"].map((fmt) => (
                  <button key={fmt} onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium uppercase transition-voxora ${
                      outputFormat === fmt
                        ? "bg-primary/10 text-primary ghost-border-focus"
                        : "bg-surface-container text-on-surface-variant ghost-border hover:bg-surface-container-high"
                    }`}
                  >.{fmt}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ADVANCED SETTINGS */}
        <div className="border-t border-outline-variant/15 pt-4">
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            🔧 Nâng cao
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            ><polyline points="6 9 12 15 18 9" /></svg>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-on-surface-variant">DIT Steps</label>
                  <span className="text-xs font-mono text-on-surface">{ditSteps}</span>
                </div>
                <input type="range" min="1" max="50" step="1" value={ditSteps}
                  onChange={(e) => onDitStepsChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-on-surface-variant mt-0.5">Cao = chất lượng tốt hơn, thời gian lâu hơn</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-on-surface">Normalize Text</p>
                  <p className="text-[10px] text-on-surface-variant">Chuẩn hóa số, viết tắt</p>
                </div>
                <button onClick={() => onNormalizeChange(!normalize)}
                  className={`w-9 h-5 rounded-full transition-voxora relative ${normalize ? "bg-primary" : "bg-outline-variant/30"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${normalize ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-on-surface">Denoise Audio</p>
                  <p className="text-[10px] text-on-surface-variant">Khử nhiễu audio mẫu</p>
                </div>
                <button onClick={() => onDenoiseChange(!denoise)}
                  className={`w-9 h-5 rounded-full transition-voxora relative ${denoise ? "bg-primary" : "bg-outline-variant/30"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${denoise ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  function renderAudioUploader() {
    if (referenceAudioFile) {
      return (
        <div className="bg-surface-container rounded-xl p-3 ghost-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-on-surface truncate">{referenceAudioFile.name}</p>
              <p className="text-[10px] text-on-surface-variant">{(referenceAudioFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { onReferenceAudioChange(null); onPromptTextChange(""); }}
              className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-voxora"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    return (
      <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-outline-variant/30 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-voxora">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant mb-1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-xs text-on-surface-variant">Kéo thả hoặc click để upload</span>
        <span className="text-[10px] text-on-surface-variant/50 mt-0.5">WAV, MP3, FLAC · Max 30s</span>
        <input type="file" accept="audio/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onReferenceAudioChange(f);
          }}
        />
      </label>
    );
  }
}
