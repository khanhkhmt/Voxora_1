"""
Oriagent Backend — FastAPI Main Application
Supabase Auth + Admin/User RBAC
"""
import logging
import os
import uuid
import tempfile
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from auth import get_current_user, require_admin, get_supabase_admin
from tts_service import get_tts_service

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("oriagent")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Temp dir for uploaded audio files
UPLOAD_DIR = Path(tempfile.gettempdir()) / "oriagent_uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to VoxCPM on startup."""
    logger.info("🚀 Starting Oriagent Backend...")

    tts = get_tts_service()
    connected = tts.connect()
    if connected:
        logger.info("✅ VoxCPM connected — ready to serve")
    else:
        logger.warning("⚠️ VoxCPM not available — running in offline mode")

    yield

    logger.info("👋 Shutting down Oriagent Backend")


# ---------- App ----------
app = FastAPI(
    title="Oriagent API",
    description="AI Text-to-Speech Backend powered by VoxCPM — Supabase Auth",
    version="2.0.0",
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — read allowed origins from config (comma-separated)
settings = get_settings()
origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
if settings.frontend_url not in origins:
    origins.append(settings.frontend_url)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------
class HealthResponse(BaseModel):
    status: str
    model: str
    engine: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    avatar_url: str


class UpdateRoleRequest(BaseModel):
    role: str  # "user" or "admin"


# ---------- Routes: Health ----------

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check backend and VoxCPM health."""
    tts = get_tts_service()
    return tts.health_check()


# ---------- Routes: Auth ----------

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current authenticated user info (from Supabase JWT + profiles)."""
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "avatar_url": user["avatar_url"],
    }


# ---------- Routes: TTS ----------

@app.post("/api/tts/generate")
@limiter.limit("5/minute")
async def generate_tts(
    request: Request,
    text: str = Form(...),
    mode: str = Form("design"),
    control_instruction: str = Form(""),
    prompt_text: str = Form(""),
    cfg_value: float = Form(2.0),
    normalize: bool = Form(False),
    denoise: bool = Form(False),
    dit_steps: int = Form(10),
    reference_audio: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    """
    Generate TTS audio. Requires Supabase authentication.

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
                filename=f"oriagent_{mode}_{uuid.uuid4().hex[:8]}.wav",
            )
        else:
            raise HTTPException(status_code=500, detail="Audio file not found after generation")

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"TTS generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi tạo audio: {str(e)}")


# ---------- Routes: ASR ----------

@app.post("/api/asr/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Auto-transcribe audio using VoxCPM's built-in FunASR.
    For now, returns a placeholder — full implementation requires
    adding an ASR endpoint to the Gradio app.
    """
    # TODO: Implement when Gradio API supports ASR endpoint
    return {
        "transcript": "Tính năng Auto Transcribe sẽ hoạt động khi ASR endpoint được thêm vào Gradio API.",
        "language": "vi",
        "duration": 0,
    }


# ---------- Routes: Admin ----------

@app.get("/api/admin/users")
async def list_users(admin: dict = Depends(require_admin)):
    """List all users with their profiles. Admin only."""
    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
        return {"users": result.data or []}
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(status_code=500, detail="Lỗi lấy danh sách người dùng")


@app.patch("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleRequest,
    admin: dict = Depends(require_admin),
):
    """Change a user's role. Admin only."""
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role phải là 'user' hoặc 'admin'")

    # Prevent admin from demoting themselves
    if user_id == admin["id"] and body.role != "admin":
        raise HTTPException(status_code=400, detail="Không thể tự hạ quyền chính mình")

    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").update({"role": body.role}).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        return {"message": f"Đã đổi role thành '{body.role}'", "user": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update role for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Lỗi cập nhật role")


@app.delete("/api/admin/users/{user_id}")
async def deactivate_user(
    user_id: str,
    admin: dict = Depends(require_admin),
):
    """Deactivate (soft delete) a user account. Admin only."""
    # Prevent admin from deactivating themselves
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể vô hiệu hoá chính mình")

    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").update({"is_active": False}).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        return {"message": "Đã vô hiệu hoá tài khoản", "user": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to deactivate user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Lỗi vô hiệu hoá tài khoản")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
