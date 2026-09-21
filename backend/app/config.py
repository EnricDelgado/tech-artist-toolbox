"""Configuración leída de variables de entorno."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Persistencia. Vacío == modo sin BD (para tests o para arrancar sin Postgres).
    database_url: str = Field(default="", alias="DATABASE_URL")

    # Coma-separado: "http://localhost:3000,https://foo.dev".
    api_cors_origins: str = Field(default="http://localhost:3000", alias="API_CORS_ORIGINS")

    api_rate_limit_per_minute: int = Field(default=60, alias="API_RATE_LIMIT_PER_MINUTE")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]


def get_settings() -> Settings:
    return Settings()
