from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Accepts SUPABASE_URL or VITE_SUPABASE_URL (frontend .env fallback)
    supabase_url: str = Field(
        validation_alias=AliasChoices("SUPABASE_URL", "VITE_SUPABASE_URL")
    )
    # Accepts service role key or anon key as fallback for local testing
    supabase_service_role_key: str = Field(
        validation_alias=AliasChoices(
            "SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"
        )
    )
    # Comma-separated origins e.g. "http://localhost:5173,https://app.onrender.com"
    cors_origin: str = Field(default="http://localhost:5173", alias="CORS_ORIGIN")

    # Gmail SMTP — optional, enables auto-email of credentials on invite
    smtp_email: str = Field(default="", alias="SMTP_EMAIL")
    smtp_app_password: str = Field(default="", alias="SMTP_APP_PASSWORD")
    # Public URL shown in invite email
    app_url: str = Field(default="http://localhost:8083", alias="APP_URL")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origin.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
