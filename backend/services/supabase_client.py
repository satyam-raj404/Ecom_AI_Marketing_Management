"""Singleton Supabase client using service-role key (bypasses RLS for server ops)."""
from functools import lru_cache
from supabase import create_client, Client
from backend.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
