"""
Oriagent Backend — Auth utilities (Supabase JWT verification)
Verifies JWT tokens issued by Supabase Auth and retrieves user role from profiles table.
"""
import logging
import jwt as pyjwt  # PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

from config import get_settings

logger = logging.getLogger("oriagent.auth")
security = HTTPBearer()

# Cache Supabase admin client (service_role)
_supabase_admin: Client | None = None


def get_supabase_admin() -> Client:
    """Get Supabase admin client (uses service_role key for full access)."""
    global _supabase_admin
    if _supabase_admin is None:
        settings = get_settings()
        _supabase_admin = create_client(settings.supabase_url, settings.supabase_service_key)
    return _supabase_admin


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Supabase JWT token and return user info.
    Returns: {"id": str, "email": str, "role": str}
    Used as FastAPI dependency.
    """
    settings = get_settings()
    token = credentials.credentials

    try:
        # Log token header for debugging (safe - header is not secret)
        try:
            header = pyjwt.get_unverified_header(token)
            logger.info(f"JWT header: alg={header.get('alg')}, typ={header.get('typ')}")
        except Exception as he:
            logger.warning(f"Cannot read JWT header: {he}")

        # Log secret length for debugging
        secret = settings.supabase_jwt_secret
        logger.info(f"JWT secret length: {len(secret)}, first 4 chars: {secret[:4]}")

        # Decode JWT using Supabase JWT secret (PyJWT)
        # Disable audience verification to avoid mismatches
        payload = pyjwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")
        email = payload.get("email")

        logger.info(f"JWT decoded successfully for user: {email} (sub={user_id})")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ: thiếu user ID",
            )

    except pyjwt.ExpiredSignatureError:
        logger.warning("JWT expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn",
        )
    except pyjwt.InvalidSignatureError as e:
        logger.warning(f"JWT signature invalid: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ: chữ ký sai",
        )
    except pyjwt.DecodeError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ: lỗi giải mã",
        )
    except pyjwt.InvalidTokenError as e:
        logger.warning(f"JWT verification failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
        )

    # Query role from profiles table
    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").select("role, is_active, full_name, avatar_url").eq("id", user_id).single().execute()
        profile = result.data

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Profile không tồn tại. Vui lòng liên hệ admin.",
            )

        if not profile.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản đã bị vô hiệu hoá.",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query profile for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi truy vấn thông tin người dùng",
        )

    return {
        "id": user_id,
        "email": email,
        "role": profile.get("role", "user"),
        "full_name": profile.get("full_name", ""),
        "avatar_url": profile.get("avatar_url", ""),
    }


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    FastAPI dependency: only allows admin users.
    Must be used after get_current_user.
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có quyền truy cập",
        )
    return user
