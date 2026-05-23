from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    # Comma-separated origins, e.g. "http://localhost:5173,https://your-app.vercel.app"
    cors_origin: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origin.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),   # backend/.env takes priority, falls back to root
        env_file_encoding="utf-8",
        extra="ignore",                       # ignore VITE_* and other frontend vars
    )


settings = Settings()
