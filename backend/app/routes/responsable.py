from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.models.usuario import Usuario
from app.models.asistencia import Asistencia
from app.models.horario import Horario
from app.models.maestro import Maestro
from app.models.materia import Materia
from app.models.aula import Aula
from app.schemas.asistencia import RegistrarAsistenciaManual
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


@router.post("/asistencia")
def registrar_asistencia_manual(
    datos: RegistrarAsistenciaManual,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("responsable"))
):

    # Buscar horario
    horario = db.query(Horario).filter(
        Horario.id == datos.horario_id,
        Horario.activo == True
    ).first()

    if not horario:
        raise HTTPException(
            status_code=404,
            detail="Horario no encontrado"
        )

    # Verificar que el aula corresponda al horario
    if horario.aula_id != datos.aula_id:
        raise HTTPException(
            status_code=400,
            detail="El aula no corresponde al horario seleccionado"
        )

    # Validar estado
    estados_validos = [
        "PRESENTE",
        "RETARDO",
        "FALTA"
    ]

    if datos.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail="Estado de asistencia inválido"
        )

    # Evitar duplicados
    asistencia_existente = db.query(Asistencia).filter(
        Asistencia.horario_id == datos.horario_id,
        Asistencia.fecha == datos.fecha
    ).first()

    if asistencia_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una asistencia registrada para este horario y fecha"
        )

    # Crear asistencia
    ahora = datetime.now()

    asistencia = Asistencia(
        horario_id=datos.horario_id,
        aula_id=datos.aula_id,
        fecha=datos.fecha,
        hora_registro=ahora,
        estado=datos.estado,
        tipo_registro="MANUAL",
        motivo=datos.motivo,
        responsable_id=usuario.id
    )

    db.add(asistencia)
    db.commit()
    db.refresh(asistencia)

    return {
        "mensaje": "Asistencia manual registrada correctamente",
        "asistencia": {
            "id": asistencia.id,
            "horario_id": asistencia.horario_id,
            "aula_id": asistencia.aula_id,
            "fecha": str(asistencia.fecha),
            "hora_registro": str(asistencia.hora_registro),
            "estado": asistencia.estado,
            "tipo_registro": asistencia.tipo_registro,
            "motivo": asistencia.motivo,
            "responsable_id": asistencia.responsable_id
        }
    }


@router.get("/asistencias")
def obtener_asistencias(
    fecha: date | None = None,
    maestro_id: int | None = None,
    materia_id: int | None = None,
    aula_id: int | None = None,
    estado: str | None = None,
    tipo_registro: str | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("responsable"))
):

    query = (
        db.query(Asistencia)
        .join(Horario, Asistencia.horario_id == Horario.id)
        .join(Maestro, Horario.maestro_id == Maestro.id)
        .join(Materia, Horario.materia_id == Materia.id)
        .join(Aula, Asistencia.aula_id == Aula.id)
    )

    # Filtros
    if fecha:
        query = query.filter(
            Asistencia.fecha == fecha
        )

    if maestro_id:
        query = query.filter(
            Horario.maestro_id == maestro_id
        )

    if materia_id:
        query = query.filter(
            Horario.materia_id == materia_id
        )

    if aula_id:
        query = query.filter(
            Asistencia.aula_id == aula_id
        )

    if estado:
        query = query.filter(
            Asistencia.estado == estado
        )

    if tipo_registro:
        query = query.filter(
            Asistencia.tipo_registro == tipo_registro
        )

    asistencias = (
        query
        .order_by(
            Asistencia.fecha.desc(),
            Asistencia.hora_registro.desc()
        )
        .all()
    )

    return [
        {
            "id": asistencia.id,
            "maestro": asistencia.horario.maestro.nombre_completo,
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


@router.get("/resumen")
def obtener_resumen(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("responsable"))
):

    hoy = datetime.now().date()

    asistencias = db.query(Asistencia).filter(
        Asistencia.fecha == hoy
    ).all()

    presentes = sum(
        1 for a in asistencias
        if a.estado == "PRESENTE"
    )

    retardos = sum(
        1 for a in asistencias
        if a.estado == "RETARDO"
    )

    faltas = sum(
        1 for a in asistencias
        if a.estado == "FALTA"
    )

    return {
        "fecha": str(hoy),
        "presentes": presentes,
        "retardos": retardos,
        "faltas": faltas,
        "total": len(asistencias)
    }


@router.get("/horarios")
def obtener_horarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("responsable"))
):

    horarios = (
        db.query(Horario)
        .filter(Horario.activo == True)
        .all()
    )

    return [
        {
            "id": horario.id,
            "maestro_id": horario.maestro_id,
            "maestro": horario.maestro.nombre_completo,
            "materia_id": horario.materia_id,
            "materia": horario.materia.nombre,
            "aula_id": horario.aula_id,
            "aula": horario.aula.nombre,
            "dia_semana": horario.dia_semana,
            "hora_inicio": str(horario.hora_inicio),
            "hora_fin": str(horario.hora_fin)
        }
        for horario in horarios
    ]