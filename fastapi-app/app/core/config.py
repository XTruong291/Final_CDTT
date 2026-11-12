import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Tự động xác định thư mục gốc của dự án (thư mục be-espirit)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# Nạp file .env vào môi trường nếu biến chưa được thiết lập trước đó (giữ biến môi trường từ Docker/Cloud)
load_dotenv(dotenv_path=ENV_PATH, override=False)


class Settings(BaseSettings):
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_SERVER: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "test_db"

    SECRET_KEY: str = "your_super_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 180

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    SENDER_EMAIL: str = ""
    SENDER_PASSWORD: str = ""

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    CHAT_HISTORY_LIMIT: int = 10
    RAG_TOP_K: int = 3

    @property
    def DATABASE_URL(self) -> str:
        password = quote_plus(self.MYSQL_PASSWORD)
        return f"mysql+aiomysql://{self.MYSQL_USER}:{password}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

    model_config = SettingsConfigDict(
        extra="ignore",
    )


settings = Settings()

# Debug log hiển thị trực tiếp khi khởi động server
print("\n" + "="*40)
print(f"1. Kiểm tra vị trí file .env : {ENV_PATH}")
print(f"2. File .env có tồn tại không: {ENV_PATH.exists()}")
print(f"3. SENDER_EMAIL              : {settings.SENDER_EMAIL or '[BỊ RỖNG]'}")
print(f"4. SENDER_PASSWORD           : {'ĐÃ LOAD (OK)' if settings.SENDER_PASSWORD else '[BỊ RỖNG]'}")
print("="*40 + "\n")