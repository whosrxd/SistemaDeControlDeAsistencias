import os

from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from dotenv import load_dotenv

from app.database import get_db
from app.models.usuario import Usuario

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

security = HTTPBearer()


def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id = payload.get("sub")

        if usuario_id is None:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == int(usuario_id)
    ).first()

    if not usuario or not usuario.activo:
        raise HTTPException(
            status_code=401,
            detail="Usuario no válido"
        )

    return usuario

def requiere_rol(*roles_permitidos):
    def verificar_rol(
        usuario: Usuario = Depends(obtener_usuario_actual)
    ):
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para realizar esta acción"
            )

        return usuario

    return verificar_rol