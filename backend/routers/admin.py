"""Admin endpoints — invite users, manage roles, revoke access."""
import secrets
import string
import logging
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from backend.services.supabase_client import get_supabase
from backend.services.email import send_credentials_email
from backend.config import settings

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_EMAIL = "getdev24@gmail.com"
ROLES = ["admin", "member", "viewer"]


def _require_admin(authorization: str) -> None:
    """Verify the caller is the admin by checking their Supabase JWT."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    sb = get_supabase()
    try:
        resp = sb.auth.get_user(token)
        user = resp.user
        if not user or user.email != ADMIN_EMAIL:
            raise HTTPException(403, "Admin access required")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid token")


def _gen_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%&"
    return "".join(secrets.choice(chars) for _ in range(length))


class InviteBody(BaseModel):
    email: str
    display_name: str
    role: str = "member"
    position: str = ""


class RoleBody(BaseModel):
    role: str


# ── Invite new user ──────────────────────────────────────────────────────────

@router.post("/invite")
async def invite_user(body: InviteBody, authorization: str = Header(...)):
    _require_admin(authorization)

    if body.role not in ROLES:
        raise HTTPException(400, f"Invalid role. Choose from: {', '.join(ROLES)}")

    sb = get_supabase()
    password = _gen_password()

    try:
        result = sb.auth.admin.create_user({
            "email": body.email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "display_name": body.display_name,
                "role": body.role,
            },
        })
        user = result.user
        if not user:
            raise HTTPException(500, "User creation returned no user object")
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "already been registered" in msg or "already exists" in msg.lower():
            raise HTTPException(409, "Email already registered")
        raise HTTPException(500, msg)

    # Create / update team_profiles row
    sb.table("team_profiles").upsert(
        {
            "user_id": user.id,
            "email": body.email,
            "display_name": body.display_name,
            "position": body.position,
            "role": body.role,
        },
        on_conflict="user_id",
    ).execute()

    # Send credentials email if SMTP configured
    email_sent = False
    if settings.smtp_email and settings.smtp_app_password:
        try:
            send_credentials_email(
                to_email=body.email,
                display_name=body.display_name,
                temp_password=password,
                login_url=f"{settings.app_url}/auth",
                from_email=settings.smtp_email,
                smtp_password=settings.smtp_app_password,
            )
            email_sent = True
        except Exception as e:
            log.warning("Failed to send credentials email: %s", e)

    return {
        "success": True,
        "user_id": user.id,
        "email": body.email,
        "temp_password": password,
        "email_sent": email_sent,
    }


# ── List team members ────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(authorization: str = Header(...)):
    _require_admin(authorization)
    sb = get_supabase()
    result = sb.table("team_profiles").select("*").order("created_at").execute()
    return result.data


# ── Update role ──────────────────────────────────────────────────────────────

@router.patch("/users/{user_id}/role")
async def update_role(user_id: str, body: RoleBody, authorization: str = Header(...)):
    _require_admin(authorization)
    if body.role not in ROLES:
        raise HTTPException(400, f"Invalid role")
    sb = get_supabase()
    sb.table("team_profiles").update({"role": body.role}).eq("user_id", user_id).execute()
    return {"success": True}


# ── Revoke access (delete user) ──────────────────────────────────────────────

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, authorization: str = Header(...)):
    _require_admin(authorization)
    sb = get_supabase()
    sb.table("team_profiles").delete().eq("user_id", user_id).execute()
    sb.auth.admin.delete_user(user_id)
    return {"success": True}


# ── Reset password (generate new temp password) ──────────────────────────────

@router.post("/users/{user_id}/reset-password")
async def reset_password(user_id: str, authorization: str = Header(...)):
    _require_admin(authorization)
    sb = get_supabase()
    new_password = _gen_password()
    sb.auth.admin.update_user_by_id(user_id, {"password": new_password})
    return {"success": True, "temp_password": new_password}
