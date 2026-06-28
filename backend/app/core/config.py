from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Recruiter ATS"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str

    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    # Optional OpenAI configuration. Declaring these here allows BaseSettings to
    # load them from the .env file (or environment) so other modules can
    # retrieve them via getattr(settings, "OPENAI_API_KEY") during init.
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
