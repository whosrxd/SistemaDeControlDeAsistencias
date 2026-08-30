import os

from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone

load_dotenv()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def verificar_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def crear_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def crear_token(usuario_id: int, rol: str) -> str:
    datos = {
        "sub": str(usuario_id),
        "rol": rol,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8)
    }

    return jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM
    )