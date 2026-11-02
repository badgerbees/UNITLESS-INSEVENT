from functools import lru_cache

from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions

from app.core.config import settings


@lru_cache
def get_supabase_admin() -> Client:
    """Create the server-side Supabase client.

    The service-role key must only exist in backend environment variables.
    This client is not exposed to the browser.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase server credentials are not configured")

    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_public() -> Client:
    """Create a public-key client used only to verify a user's current password."""
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise RuntimeError("Supabase public credentials are not configured")

    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
        options=SyncClientOptions(persist_session=False, auto_refresh_token=False),
    )
