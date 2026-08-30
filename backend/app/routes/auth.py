from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import verificar_password, crear_token

from app.services.security import (
    obtener_usuario_actual,
    requiere_rol
)

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


@router.post("/login", response_model=TokenResponse)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.correo == datos.correo
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="Usuario desactivado"
        )

    if not verificar_password(
        datos.password,
        usuario.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    token = crear_token(
        usuario.id,
        usuario.rol
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol
    }
    

@router.get("/me")
def obtener_mi_usuario(
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": usuario.rol
    }
    
@router.get("/admin-test")
def admin_test(
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    return {
        "mensaje": "Tienes permisos de administrador",
        "usuario": usuario.nombre,
        "rol": usuario.rol
    }