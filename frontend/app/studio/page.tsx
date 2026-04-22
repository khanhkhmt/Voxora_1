"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/studio/Sidebar";
import TextEditor from "@/components/studio/TextEditor";
import RightPanel from "@/components/studio/RightPanel";
import StatusBar from "@/components/studio/StatusBar";

export default function StudioPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState("design");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Shared state (lifted from RightPanel → Studio → TextEditor)
  const [referenceAudioFile, setReferenceAudioFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState("");
  const [cfgValue, setCfgValue] = useState(2.0);
  const [normalize, setNormalize] = useState(false);
  const [denoise, setDenoise] = useState(false);
  const [ditSteps, setDitSteps] = useState(10);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();

    // Listen for auth changes (e.g., token refresh, logout from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Reset audio when switching modes
  useEffect(() => {
    setReferenceAudioFile(null);
    setPromptText("");
  }, [activeMode]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-on-surface-variant">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeMode={activeMode} onModeChange={setActiveMode} />

        <TextEditor
          activeMode={activeMode}
          referenceAudioFile={referenceAudioFile}
          promptText={promptText}
          cfgValue={cfgValue}
          normalize={normalize}
          denoise={denoise}
          ditSteps={ditSteps}
        />

        <RightPanel
          activeMode={activeMode}
          referenceAudioFile={referenceAudioFile}
          onReferenceAudioChange={setReferenceAudioFile}
          promptText={promptText}
          onPromptTextChange={setPromptText}
          cfgValue={cfgValue}
          onCfgChange={setCfgValue}
          normalize={normalize}
          onNormalizeChange={setNormalize}
          denoise={denoise}
          onDenoiseChange={setDenoise}
          ditSteps={ditSteps}
          onDitStepsChange={setDitSteps}
        />
      </div>

      <StatusBar />
    </div>
  );
}
