"""
Oriagent Backend — Auth utilities (Supabase JWT verification)
Verifies JWT tokens issued by Supabase Auth using JWKS public keys (ES256).
Retrieves user role from profiles table.
"""
import logging
import jwt as pyjwt  # PyJWT
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

from config import get_settings

logger = logging.getLogger("oriagent.auth")
security = HTTPBearer()

# Cache Supabase admin client (service_role)
_supabase_admin: Client | None = None
_jwks_client: PyJWKClient | None = None


def get_supabase_admin() -> Client:
    """Get Supabase admin client (uses service_role key for full access)."""
    global _supabase_admin
    if _supabase_admin is None:
        settings = get_settings()
        _supabase_admin = create_client(settings.supabase_url, settings.supabase_service_key)
    return _supabase_admin


def get_jwks_client() -> PyJWKClient:
    """Get JWKS client for verifying Supabase JWT tokens (ES256)."""
    global _jwks_client
    if _jwks_client is None:
        settings = get_settings()
        jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
        logger.info(f"JWKS client initialized: {jwks_url}")
    return _jwks_client


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Supabase JWT token and return user info.
    Uses JWKS public keys to verify ES256 tokens.
    Returns: {"id": str, "email": str, "role": str}
    """
    token = credentials.credentials

    try:
        # Get signing key from JWKS endpoint (auto-cached by PyJWKClient)
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify JWT using the public key
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        email = payload.get("email")

        logger.info(f"JWT verified OK for user: {email}")

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
    except Exception as e:
        logger.error(f"JWT verification unexpected error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Lỗi xác thực token",
        )

    # Query role from profiles table
    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").select("role, is_active, full_name, avatar_url").eq("id", user_id).single().execute()
        profile = result.data

        if not profile:
            # Auto-create profile for new users
            logger.info(f"Creating new profile for user: {email}")
            new_profile = {
                "id": user_id,
                "email": email,
                "role": "user",
                "is_active": True,
                "full_name": "",
                "avatar_url": "",
            }
            supabase.table("profiles").insert(new_profile).execute()
            profile = new_profile

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
