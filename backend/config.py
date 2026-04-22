"""
Oriagent Backend — Configuration (Pydantic Settings)
Supabase Auth integration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase Auth
    supabase_url: str          # https://xxxxx.supabase.co
    supabase_anon_key: str     # anon public key
    supabase_service_key: str  # service_role key (backend only, never expose!)
    supabase_jwt_secret: str   # JWT secret for token verification

    # VoxCPM AI Engine (Kaggle Gradio via Cloudflare Tunnel)
    voxcpm_gradio_url: str = "http://localhost:8808"

    # CORS — comma-separated origins
    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
