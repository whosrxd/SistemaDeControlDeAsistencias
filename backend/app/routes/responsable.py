from fastapi import APIRouter, Depends

from app.models.usuario import Usuario
from app.services.security import requiere_rol

router = APIRouter(
    prefix="/responsable",
    tags=["Responsable de asistencia"]
)


@router.get("/test")
def responsable_test(
    usuario: Usuario = Depends(requiere_rol("responsable"))
):
    return {
        "mensaje": "Acceso permitido al responsable de asistencia",
        "usuario": usuario.nombre,
        "rol": usuario.rol
    }