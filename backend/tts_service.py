"""
Voxora Backend — TTS Service
Connects to VoxCPM Gradio API on Kaggle via Cloudflare tunnel.
"""
import logging
import tempfile
import os
from pathlib import Path
from typing import Optional
from gradio_client import Client, handle_file
from config import get_settings

logger = logging.getLogger("voxora.tts")

# Output directory for generated audio
AUDIO_OUTPUT_DIR = Path(tempfile.gettempdir()) / "voxora_audio"
AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class TTSService:
    """Service for calling VoxCPM Gradio API remotely."""

    def __init__(self):
        self._client: Optional[Client] = None
        self._connected = False

    def connect(self) -> bool:
        """Connect to the VoxCPM Gradio API."""
        settings = get_settings()
        url = settings.voxcpm_gradio_url
        try:
            logger.info(f"Connecting to VoxCPM at {url}...")
            self._client = Client(url)
            self._connected = True
            logger.info("✅ Connected to VoxCPM Gradio API")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to VoxCPM: {e}")
            self._connected = False
            return False

    @property
    def is_connected(self) -> bool:
        return self._connected and self._client is not None

    def health_check(self) -> dict:
        """Check if VoxCPM Gradio API is reachable."""
        if not self.is_connected:
            success = self.connect()
            return {
                "status": "ready" if success else "error",
                "model": "VoxCPM2",
                "engine": "gradio_api",
                "url": get_settings().voxcpm_gradio_url,
            }
        return {
            "status": "ready",
            "model": "VoxCPM2",
            "engine": "gradio_api",
            "url": get_settings().voxcpm_gradio_url,
        }

    def generate(
        self,
        text: str,
        mode: str = "design",
        control_instruction: str = "",
        reference_audio_path: Optional[str] = None,
        prompt_text: str = "",
        cfg_value: float = 2.0,
        normalize: bool = False,
        denoise: bool = False,
        dit_steps: int = 10,
    ) -> str:
        """
        Generate TTS audio via VoxCPM Gradio API.

        The Gradio API `generate` expects 9 arguments in order:
          1. text (str)                  - Target text to speak
          2. control_instruction (str)   - Voice description / control text
          3. ref_wav (filepath|None)     - Reference audio file
          4. use_prompt_text (bool)      - Whether to use prompt_text mode (Ultimate)
          5. prompt_text_value (str)     - Transcript of reference audio
          6. cfg_value (float)           - CFG scale [1.0-3.0]
          7. do_normalize (bool)         - Normalize text
          8. denoise (bool)              - Denoise reference audio
          9. dit_steps (int)             - Inference steps [1-50]

        Returns: path to the generated audio file.
        """
        if not self.is_connected:
            raise RuntimeError("VoxCPM not connected. Call connect() first.")

        # Determine Gradio API arguments based on mode
        if mode == "design":
            # Voice Design: control only, no audio, no prompt_text
            use_prompt_text = False
            actual_control = control_instruction
            ref_wav = None
            actual_prompt_text = ""

        elif mode == "clone":
            # Controllable Cloning: control + reference audio
            use_prompt_text = False
            actual_control = control_instruction
            ref_wav = handle_file(reference_audio_path) if reference_audio_path else None
            actual_prompt_text = ""

        elif mode == "ultimate":
            # Ultimate Cloning: prompt_text + prompt_wav, NO control
            use_prompt_text = True
            actual_control = ""  # Hidden in Ultimate mode
            ref_wav = handle_file(reference_audio_path) if reference_audio_path else None
            actual_prompt_text = prompt_text

        else:
            raise ValueError(f"Unknown mode: {mode}")

        logger.info(
            f"Generating TTS | mode={mode} | text='{text[:50]}...' | "
            f"control='{actual_control[:30]}' | use_prompt={use_prompt_text} | "
            f"cfg={cfg_value} | steps={dit_steps}"
        )

        # Call Gradio API
        result = self._client.predict(
            text,                    # 1. text
            actual_control,          # 2. control_instruction
            ref_wav,                 # 3. reference_wav (filepath or None)
            use_prompt_text,         # 4. use_prompt_text
            actual_prompt_text,      # 5. prompt_text
            cfg_value,               # 6. cfg_value
            normalize,               # 7. do_normalize
            denoise,                 # 8. denoise
            dit_steps,               # 9. dit_steps
            api_name="/generate",
        )

        # Result is a tuple (sample_rate, wav_path) or just a filepath
        if isinstance(result, tuple):
            audio_path = result[0] if isinstance(result[0], str) else result[1]
        else:
            audio_path = result

        logger.info(f"✅ Audio generated: {audio_path}")
        return str(audio_path)


# Singleton
_tts_service = TTSService()


def get_tts_service() -> TTSService:
    return _tts_service
