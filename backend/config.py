"""
Voxora Backend — Configuration (Pydantic Settings)
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Auth
    admin_username: str = "admin"
    admin_password: str = "voxora2026"
    jwt_secret: str = "voxora-secret-key-change-in-production-2026"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # VoxCPM
    voxcpm_gradio_url: str = "https://anderson-glenn-polls-interaction.trycloudflare.com"

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
