from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.usuario import Usuario
from app.models.maestro import Maestro
from app.models.horario import Horario
from app.models.aula import Aula
from app.models.asistencia import Asistencia
from app.models.configuracion import Configuracion
from app.schemas.asistencia import RegistrarAsistencia
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


# =========================================================
# ASISTENCIA MEDIANTE QR
# =========================================================

@router.post("/asistencia")
def registrar_asistencia(
    datos: RegistrarAsistencia,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("maestro"))
):
    # Buscar maestro
    maestro = db.query(Maestro).filter(
        Maestro.usuario_id == usuario.id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Perfil de maestro no encontrado"
        )

    # Buscar aula mediante el QR
    aula = db.query(Aula).filter(
        Aula.qr_token == datos.qr_token,
        Aula.activo == True
    ).first()

    if not aula:
        raise HTTPException(
            status_code=404,
            detail="QR de aula no válido"
        )

    ahora = datetime.now()

    # Días de la semana
    dias = {
        0: "lunes",
        1: "martes",
        2: "miércoles",
        3: "jueves",
        4: "viernes",
        5: "sábado",
        6: "domingo"
    }

    dia_actual = dias.get(ahora.weekday())

    # Obtener configuración
    config_anticipacion = db.query(Configuracion).filter(
        Configuracion.clave == "minutos_anticipacion"
    ).first()

    config_tolerancia = db.query(Configuracion).filter(
        Configuracion.clave == "minutos_tolerancia"
    ).first()

    if not config_anticipacion or not config_tolerancia:
        raise HTTPException(
            status_code=500,
            detail="Configuración de asistencia no encontrada"
        )

    minutos_anticipacion = int(config_anticipacion.valor)
    minutos_tolerancia = int(config_tolerancia.valor)

    # Buscar horarios del maestro en esa aula y día
    horarios = db.query(Horario).filter(
        Horario.maestro_id == maestro.id,
        Horario.aula_id == aula.id,
        Horario.dia_semana == dia_actual,
        Horario.activo == True
    ).all()

    horario = None
    estado_asistencia = None

    for h in horarios:

        inicio = datetime.combine(
            ahora.date(),
            h.hora_inicio
        )

        ventana_inicio = inicio - timedelta(
            minutes=minutos_anticipacion
        )

        ventana_fin = inicio + timedelta(
            minutes=minutos_tolerancia
        )

        # Fuera de la ventana
        if ahora < ventana_inicio or ahora > ventana_fin:
            continue

        # Determinar estado
        limite_presente = inicio + timedelta(minutes=5)

        if ahora <= limite_presente:
            estado_asistencia = "PRESENTE"
        else:
            estado_asistencia = "RETARDO"

        horario = h
        break

    if not horario:
        raise HTTPException(
            status_code=400,
            detail="No tienes una clase programada en esta aula en este momento"
        )

    # Evitar registros duplicados
    asistencia_existente = db.query(Asistencia).filter(
        Asistencia.horario_id == horario.id,
        Asistencia.fecha == ahora.date()
    ).first()

    if asistencia_existente:
        raise HTTPException(
            status_code=400,
            detail="La asistencia ya fue registrada"
        )

    # Crear asistencia
    asistencia = Asistencia(
        horario_id=horario.id,
        aula_id=aula.id,
        fecha=ahora.date(),
        hora_registro=ahora,
        estado=estado_asistencia,
        tipo_registro="QR"
    )

    db.add(asistencia)
    db.commit()
    db.refresh(asistencia)

    return {
        "mensaje": "Asistencia registrada correctamente",
        "asistencia": {
            "id": asistencia.id,
            "materia": horario.materia.nombre,
            "aula": aula.nombre,
            "fecha": str(asistencia.fecha),
            "hora_registro": str(asistencia.hora_registro),
            "estado": asistencia.estado,
            "tipo_registro": asistencia.tipo_registro
        }
    }
    
@router.get("/asistencias")
def obtener_asistencias(
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

    asistencias = (
        db.query(Asistencia)
        .join(Horario, Asistencia.horario_id == Horario.id)
        .filter(
            Horario.maestro_id == maestro.id
        )
        .order_by(
            Asistencia.fecha.desc(),
            Asistencia.hora_registro.desc()
        )
        .all()
    )

    return [
        {
            "id": asistencia.id,
            "materia": asistencia.horario.materia.nombre,
            "aula": asistencia.aula.nombre,
            "fecha": str(asistencia.fecha),
            "hora_registro": (
                str(asistencia.hora_registro)
                if asistencia.hora_registro
                else None
            ),
            "estado": asistencia.estado,
            "tipo_registro": asistencia.tipo_registro,
            "motivo": asistencia.motivo
        }
        for asistencia in asistencias
    ]