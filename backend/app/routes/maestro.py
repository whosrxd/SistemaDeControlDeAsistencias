from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.maestro import Maestro
from app.models.horario import Horario
from app.services.security import requiere_rol


router = APIRouter(
    prefix="/maestro",
    tags=["Maestro"]
)


@router.get("/test")
def maestro_test(
    usuario: Usuario = Depends(requiere_rol("maestro"))
):
    return {
        "mensaje": "Acceso permitido al maestro",
        "usuario": usuario.nombre,
        "rol": usuario.rol
    }


@router.get("/perfil")
def obtener_perfil(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("maestro"))
):
    maestro = db.query(Maestro).filter(
        Maestro.usuario_id == usuario.id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Perfil de maestro no encontrado"
        )

    return {
        "id": maestro.id,
        "nombre": maestro.nombre_completo,
        "correo": usuario.correo,
        "numero_empleado": maestro.numero_empleado
    }


@router.get("/horarios")
def obtener_horarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("maestro"))
):
    maestro = db.query(Maestro).filter(
        Maestro.usuario_id == usuario.id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Perfil de maestro no encontrado"
        )

    horarios = (
        db.query(Horario)
        .filter(
            Horario.maestro_id == maestro.id,
            Horario.activo == True
        )
        .all()
    )

    return [
        {
            "id": horario.id,
            "materia": horario.materia.nombre,
            "aula": horario.aula.nombre,
            "dia_semana": horario.dia_semana,
            "hora_inicio": str(horario.hora_inicio),
            "hora_fin": str(horario.hora_fin)
        }
        for horario in horarios
    ]