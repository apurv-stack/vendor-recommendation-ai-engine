from pydantic_settings import (

    BaseSettings,

    SettingsConfigDict

)


class Settings(

    BaseSettings

):

    # -----------------------------
    # DATABASE
    # -----------------------------

    DATABASE_URL: str


    # -----------------------------
    # JWT
    # -----------------------------

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7


    # -----------------------------
    # GEMINI
    # -----------------------------

    GEMINI_API_KEY: str | None = None


    # -----------------------------
    # GROQ
    # -----------------------------

    GROQ_API_KEY: str | None = None


    # -----------------------------
    # MODELSCOPE
    # -----------------------------

    MODELSCOPE_API_KEY: str | None = None


    # -----------------------------
    # OLLAMA
    # -----------------------------

    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"


    # -----------------------------
    # AI
    # -----------------------------

    AI_PROVIDER: str = "ollama"

    AI_MODEL: str = "qwen2.5:7b"

    AI_TIMEOUT: int = 45

    # -----------------------------
    # RESPONSE LLM (Groq for fast human-toned responses)
    # -----------------------------

    RESPONSE_AI_PROVIDER: str = "groq"

    RESPONSE_AI_MODEL: str = "llama3-8b-8192"

    # -----------------------------
    # INTERNAL API
    # -----------------------------

    API_BASE_URL: str = "http://localhost:8000"


    # -----------------------------
    # ENV
    # -----------------------------

    model_config = (

        SettingsConfigDict(

            env_file=".env",

            extra="ignore"

        )

    )


settings = Settings()  # type: ignore


print(

    "AI PROVIDER:",

    settings.AI_PROVIDER

)

print(

    "AI MODEL:",

    settings.AI_MODEL

)

print(

    "OLLAMA URL:",

    settings.OLLAMA_BASE_URL

)