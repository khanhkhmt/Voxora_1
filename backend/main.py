"""
Voxora Backend — FastAPI Main Application
"""
import logging
import os
import uuid
import tempfile
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from config import get_settings
from auth import create_access_token, verify_token
from tts_service import get_tts_service

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("voxora")

# Temp dir for uploaded audio files
UPLOAD_DIR = Path(tempfile.gettempdir()) / "voxora_uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to VoxCPM on startup."""
    logger.info("🚀 Starting Voxora Backend...")

    tts = get_tts_service()
    connected = tts.connect()
    if connected:
        logger.info("✅ VoxCPM connected — ready to serve")
    else:
        logger.warning("⚠️ VoxCPM not available — running in offline mode")

    yield

    logger.info("👋 Shutting down Voxora Backend")


# ---------- App ----------
app = FastAPI(
    title="Voxora API",
    description="AI Text-to-Speech Backend powered by VoxCPM",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class TTSRequest(BaseModel):
    text: str
    mode: str = "design"  # design | clone | ultimate
    control_instruction: str = ""
    prompt_text: str = ""
    cfg_value: float = 2.0
    normalize: bool = False
    denoise: bool = False
    dit_steps: int = 10


class HealthResponse(BaseModel):
    status: str
    model: str
    engine: str
    url: str


# ---------- Routes ----------

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check backend and VoxCPM health."""
    tts = get_tts_service()
    return tts.health_check()


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    """Admin login — returns JWT token."""
    settings = get_settings()
    if req.username != settings.admin_username or req.password != settings.admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
        )
    token = create_access_token(req.username)
    return LoginResponse(access_token=token, username=req.username)


@app.get("/api/auth/me")
async def get_current_user(username: str = Depends(verify_token)):
    """Get current authenticated user."""
    return {"username": username, "role": "admin"}


@app.post("/api/tts/generate")
async def generate_tts(
    text: str = Form(...),
    mode: str = Form("design"),
    control_instruction: str = Form(""),
    prompt_text: str = Form(""),
    cfg_value: float = Form(2.0),
    normalize: bool = Form(False),
    denoise: bool = Form(False),
    dit_steps: int = Form(10),
    reference_audio: Optional[UploadFile] = File(None),
    username: str = Depends(verify_token),
):
    """
    Generate TTS audio.

    Accepts multipart/form-data:
    - text: target text
    - mode: design | clone | ultimate
    - control_instruction: voice description (Design & Clone modes)
    - prompt_text: transcript of reference audio (Ultimate mode)
    - reference_audio: uploaded audio file (Clone & Ultimate modes)
    - cfg_value, normalize, denoise, dit_steps: generation settings
    """
    tts = get_tts_service()
    if not tts.is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VoxCPM model chưa sẵn sàng. Hãy kiểm tra Kaggle tunnel.",
        )

    # Validate mode
    if mode not in ("design", "clone", "ultimate"):
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")

    # Save uploaded audio to temp file
    reference_audio_path = None
    if reference_audio and reference_audio.filename:
        ext = Path(reference_audio.filename).suffix or ".wav"
        temp_path = UPLOAD_DIR / f"{uuid.uuid4()}{ext}"
        with open(temp_path, "wb") as f:
            content = await reference_audio.read()
            f.write(content)
        reference_audio_path = str(temp_path)
        logger.info(f"📁 Saved reference audio: {temp_path} ({len(content)} bytes)")

    # Validate: Clone & Ultimate require audio
    if mode in ("clone", "ultimate") and not reference_audio_path:
        raise HTTPException(
            status_code=400,
            detail=f"Mode '{mode}' cần audio mẫu (reference_audio)",
        )

    # Validate: Ultimate requires prompt_text
    if mode == "ultimate" and not prompt_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Mode 'ultimate' cần transcript (prompt_text)",
        )

    try:
        output_path = tts.generate(
            text=text,
            mode=mode,
            control_instruction=control_instruction,
            reference_audio_path=reference_audio_path,
            prompt_text=prompt_text,
            cfg_value=cfg_value,
            normalize=normalize,
            denoise=denoise,
            dit_steps=dit_steps,
        )

        # Return audio file
        if os.path.exists(output_path):
            return FileResponse(
                path=output_path,
                media_type="audio/wav",
                filename=f"voxora_{mode}_{uuid.uuid4().hex[:8]}.wav",
            )
        else:
            raise HTTPException(status_code=500, detail="Audio file not found after generation")

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"TTS generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi tạo audio: {str(e)}")


@app.post("/api/asr/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    username: str = Depends(verify_token),
):
    """
    Auto-transcribe audio using VoxCPM's built-in FunASR.
    This would call the ASR functionality on Kaggle.
    For now, returns a placeholder — full implementation requires
    adding an ASR endpoint to the Gradio app.
    """
    # TODO: Implement when Gradio API supports ASR endpoint
    # For now, return mock
    return {
        "transcript": "Tính năng Auto Transcribe sẽ hoạt động khi ASR endpoint được thêm vào Gradio API.",
        "language": "vi",
        "duration": 0,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
