from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.asistencia import Asistencia
from app.models.horario import Horario
from app.models.maestro import Maestro
from app.models.materia import Materia
from app.models.aula import Aula
from app.models.usuario import Usuario
from app.models.configuracion import Configuracion


def generar_faltas_automaticas(db: Session):

    ahora = datetime.now()

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

    config_tolerancia = db.query(Configuracion).filter(
        Configuracion.clave == "minutos_tolerancia"
    ).first()

    if not config_tolerancia:
        return 0

    minutos_tolerancia = int(config_tolerancia.valor)

    horarios = db.query(Horario).filter(
        Horario.dia_semana == dia_actual,
        Horario.activo == True
    ).all()

    faltas_creadas = 0

    for horario in horarios:

        inicio = datetime.combine(
            ahora.date(),
            horario.hora_inicio
        )

        limite = inicio + timedelta(
            minutes=minutos_tolerancia
        )

        if ahora <= limite:
            continue

        asistencia_existente = db.query(Asistencia).filter(
            Asistencia.horario_id == horario.id,
            Asistencia.fecha == ahora.date()
        ).first()

        if asistencia_existente:
            continue

        asistencia = Asistencia(
            horario_id=horario.id,
            aula_id=horario.aula_id,
            fecha=ahora.date(),
            hora_registro=None,
            estado="FALTA",
            tipo_registro="AUTOMATICO",
            motivo="Falta generada automáticamente"
        )

        db.add(asistencia)
        faltas_creadas += 1

    db.commit()

    return faltas_creadas