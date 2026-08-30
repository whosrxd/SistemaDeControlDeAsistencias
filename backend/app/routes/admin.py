from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

# Database / Usuario
from app.database import engine, get_db
from app.models.usuario import Usuario

# Maestros
from app.models.maestro import Maestro
from app.schemas.maestro import MaestroCrear, MaestroActualizar

# Materia
from app.models.materia import Materia
from app.schemas.materia import MateriaCrear, MateriaActualizar

# Aulas
from app.models.aula import Aula
from app.schemas.aula import AulaCrear, AulaActualizar

# Horarios
from app.models.horario import Horario
from app.schemas.horario import HorarioCrear, HorarioActualizar

from app.services.auth import crear_password_hash
from app.services.security import requiere_rol


router = APIRouter(
    prefix="/admin",
    tags=["Administrador"]
)


@router.get("/test")
def admin_test(
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    return {
        "mensaje": "Acceso permitido al administrador",
        "usuario": usuario.nombre,
        "rol": usuario.rol
    }


@router.get("/dashboard")
def dashboard(
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    with engine.connect() as connection:

        maestros = connection.execute(
            text("SELECT COUNT(*) FROM maestros WHERE activo = TRUE")
        ).scalar()

        materias = connection.execute(
            text("SELECT COUNT(*) FROM materias WHERE activo = TRUE")
        ).scalar()

        aulas = connection.execute(
            text("SELECT COUNT(*) FROM aulas WHERE activo = TRUE")
        ).scalar()

        presentes = connection.execute(
            text("""
                SELECT COUNT(*)
                FROM asistencias
                WHERE fecha = CURDATE()
                AND estado = 'PRESENTE'
            """)
        ).scalar()

        retardos = connection.execute(
            text("""
                SELECT COUNT(*)
                FROM asistencias
                WHERE fecha = CURDATE()
                AND estado = 'RETARDO'
            """)
        ).scalar()

        faltas = connection.execute(
            text("""
                SELECT COUNT(*)
                FROM asistencias
                WHERE fecha = CURDATE()
                AND estado = 'FALTA'
            """)
        ).scalar()

    return {
        "maestros": maestros,
        "materias": materias,
        "aulas": aulas,
        "asistencias_hoy": {
            "presentes": presentes,
            "retardos": retardos,
            "faltas": faltas
        }
    }


# =========================
# CREAR MAESTRO
# =========================

@router.post("/maestros")
def crear_maestro(
    datos: MaestroCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    # Comprobar correo
    existe_correo = db.query(Usuario).filter(
        Usuario.correo == datos.correo
    ).first()

    if existe_correo:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    # Comprobar número de empleado
    existe_numero = db.query(Maestro).filter(
        Maestro.numero_empleado == datos.numero_empleado
    ).first()

    if existe_numero:
        raise HTTPException(
            status_code=400,
            detail="El número de empleado ya está registrado"
        )

    # Crear usuario
    nuevo_usuario = Usuario(
        nombre=datos.nombre_completo,
        correo=datos.correo,
        password_hash=crear_password_hash(datos.password),
        rol="maestro",
        activo=True
    )

    db.add(nuevo_usuario)
    db.flush()

    # Crear maestro
    nuevo_maestro = Maestro(
        usuario_id=nuevo_usuario.id,
        numero_empleado=datos.numero_empleado,
        nombre_completo=datos.nombre_completo,
        activo=True
    )

    db.add(nuevo_maestro)
    db.commit()
    db.refresh(nuevo_maestro)

    return {
        "mensaje": "Maestro creado correctamente",
        "maestro": {
            "id": nuevo_maestro.id,
            "usuario_id": nuevo_usuario.id,
            "nombre_completo": nuevo_maestro.nombre_completo,
            "numero_empleado": nuevo_maestro.numero_empleado,
            "correo": nuevo_usuario.correo,
            "activo": nuevo_maestro.activo
        }
    }


# =========================
# LISTAR MAESTROS
# =========================

@router.get("/maestros")
def listar_maestros(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    maestros = (
        db.query(Maestro)
        .join(Usuario)
        .all()
    )

    return [
        {
            "id": maestro.id,
            "usuario_id": maestro.usuario_id,
            "nombre_completo": maestro.nombre_completo,
            "numero_empleado": maestro.numero_empleado,
            "correo": maestro.usuario.correo,
            "activo": maestro.activo
        }
        for maestro in maestros
    ]


# =========================
# EDITAR MAESTRO
# =========================

@router.put("/maestros/{maestro_id}")
def editar_maestro(
    maestro_id: int,
    datos: MaestroActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    maestro = db.query(Maestro).filter(
        Maestro.id == maestro_id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Maestro no encontrado"
        )

    maestro.nombre_completo = datos.nombre_completo
    maestro.numero_empleado = datos.numero_empleado

    maestro.usuario.nombre = datos.nombre_completo
    maestro.usuario.correo = datos.correo

    # Solo cambia la contraseña si se proporcionó una nueva
    if datos.password:
        maestro.usuario.password_hash = crear_password_hash(
            datos.password
        )

    db.commit()

    return {
        "mensaje": "Maestro actualizado correctamente"
    }


# =========================
# ACTIVAR / DESACTIVAR
# =========================

@router.patch("/maestros/{maestro_id}/estado")
def cambiar_estado_maestro(
    maestro_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    maestro = db.query(Maestro).filter(
        Maestro.id == maestro_id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Maestro no encontrado"
        )

    maestro.activo = not maestro.activo
    maestro.usuario.activo = maestro.activo

    db.commit()

    return {
        "mensaje": "Estado actualizado correctamente",
        "activo": maestro.activo
    }
    
# =========================
# LISTAR MATERIAS
# =========================

@router.get("/materias")
def listar_materias(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    materias = db.query(Materia).all()

    return [
        {
            "id": materia.id,
            "nombre": materia.nombre,
            "clave": materia.clave,
            "activo": materia.activo
        }
        for materia in materias
    ]


# =========================
# CREAR MATERIA
# =========================

@router.post("/materias")
def crear_materia(
    datos: MateriaCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    existe = db.query(Materia).filter(
        Materia.clave == datos.clave
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="La clave de la materia ya está registrada"
        )

    nueva_materia = Materia(
        nombre=datos.nombre,
        clave=datos.clave,
        activo=True
    )

    db.add(nueva_materia)
    db.commit()
    db.refresh(nueva_materia)

    return {
        "mensaje": "Materia creada correctamente",
        "materia": {
            "id": nueva_materia.id,
            "nombre": nueva_materia.nombre,
            "clave": nueva_materia.clave,
            "activo": nueva_materia.activo
        }
    }


# =========================
# EDITAR MATERIA
# =========================

@router.put("/materias/{materia_id}")
def editar_materia(
    materia_id: int,
    datos: MateriaActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    materia = db.query(Materia).filter(
        Materia.id == materia_id
    ).first()

    if not materia:
        raise HTTPException(
            status_code=404,
            detail="Materia no encontrada"
        )

    # Comprobar que la nueva clave no pertenezca a otra materia
    existe = db.query(Materia).filter(
        Materia.clave == datos.clave,
        Materia.id != materia_id
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="La clave de la materia ya está registrada"
        )

    materia.nombre = datos.nombre
    materia.clave = datos.clave

    db.commit()

    return {
        "mensaje": "Materia actualizada correctamente"
    }


# =========================
# ACTIVAR / DESACTIVAR
# =========================

@router.patch("/materias/{materia_id}/estado")
def cambiar_estado_materia(
    materia_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    materia = db.query(Materia).filter(
        Materia.id == materia_id
    ).first()

    if not materia:
        raise HTTPException(
            status_code=404,
            detail="Materia no encontrada"
        )

    materia.activo = not materia.activo

    db.commit()

    return {
        "mensaje": "Estado actualizado correctamente",
        "activo": materia.activo
    }
    
# =========================
# LISTAR AULAS
# =========================

@router.get("/aulas")
def listar_aulas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    aulas = db.query(Aula).all()

    return [
        {
            "id": aula.id,
            "nombre": aula.nombre,
            "qr_token": aula.qr_token,
            "activo": aula.activo
        }
        for aula in aulas
    ]


# =========================
# CREAR AULA
# =========================

@router.post("/aulas")
def crear_aula(
    datos: AulaCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    existe = db.query(Aula).filter(
        Aula.nombre == datos.nombre
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="El aula ya está registrada"
        )

    nueva_aula = Aula(
        nombre=datos.nombre
    )

    db.add(nueva_aula)
    db.commit()
    db.refresh(nueva_aula)

    return {
        "mensaje": "Aula creada correctamente",
        "aula": {
            "id": nueva_aula.id,
            "nombre": nueva_aula.nombre,
            "qr_token": nueva_aula.qr_token,
            "activo": nueva_aula.activo
        }
    }


# =========================
# EDITAR AULA
# =========================

@router.put("/aulas/{aula_id}")
def editar_aula(
    aula_id: int,
    datos: AulaActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    aula = db.query(Aula).filter(
        Aula.id == aula_id
    ).first()

    if not aula:
        raise HTTPException(
            status_code=404,
            detail="Aula no encontrada"
        )

    existe = db.query(Aula).filter(
        Aula.nombre == datos.nombre,
        Aula.id != aula_id
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un aula con ese nombre"
        )

    aula.nombre = datos.nombre

    db.commit()

    return {
        "mensaje": "Aula actualizada correctamente"
    }


# =========================
# ACTIVAR / DESACTIVAR
# =========================

@router.patch("/aulas/{aula_id}/estado")
def cambiar_estado_aula(
    aula_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    aula = db.query(Aula).filter(
        Aula.id == aula_id
    ).first()

    if not aula:
        raise HTTPException(
            status_code=404,
            detail="Aula no encontrada"
        )

    aula.activo = not aula.activo

    db.commit()

    return {
        "mensaje": "Estado actualizado correctamente",
        "activo": aula.activo
    }
    
@router.get("/horarios")
def listar_horarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    horarios = db.query(Horario).all()

    return [
        {
            "id": horario.id,
            "maestro_id": horario.maestro_id,
            "materia_id": horario.materia_id,
            "aula_id": horario.aula_id,
            "dia_semana": horario.dia_semana,
            "hora_inicio": str(horario.hora_inicio),
            "hora_fin": str(horario.hora_fin),
            "activo": horario.activo
        }
        for horario in horarios
    ]


@router.post("/horarios")
def crear_horario(
    datos: HorarioCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    maestro = db.query(Maestro).filter(
        Maestro.id == datos.maestro_id
    ).first()

    if not maestro:
        raise HTTPException(
            status_code=404,
            detail="Maestro no encontrado"
        )

    materia = db.query(Materia).filter(
        Materia.id == datos.materia_id
    ).first()

    if not materia:
        raise HTTPException(
            status_code=404,
            detail="Materia no encontrada"
        )

    aula = db.query(Aula).filter(
        Aula.id == datos.aula_id
    ).first()

    if not aula:
        raise HTTPException(
            status_code=404,
            detail="Aula no encontrada"
        )

    nuevo_horario = Horario(
        maestro_id=datos.maestro_id,
        materia_id=datos.materia_id,
        aula_id=datos.aula_id,
        dia_semana=datos.dia_semana,
        hora_inicio=datos.hora_inicio,
        hora_fin=datos.hora_fin,
        activo=True
    )

    db.add(nuevo_horario)
    db.commit()
    db.refresh(nuevo_horario)

    return {
        "mensaje": "Horario creado correctamente",
        "horario": {
            "id": nuevo_horario.id,
            "maestro_id": nuevo_horario.maestro_id,
            "materia_id": nuevo_horario.materia_id,
            "aula_id": nuevo_horario.aula_id,
            "dia_semana": nuevo_horario.dia_semana,
            "hora_inicio": str(nuevo_horario.hora_inicio),
            "hora_fin": str(nuevo_horario.hora_fin),
            "activo": nuevo_horario.activo
        }
    }


@router.put("/horarios/{horario_id}")
def editar_horario(
    horario_id: int,
    datos: HorarioActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    horario = db.query(Horario).filter(
        Horario.id == horario_id
    ).first()

    if not horario:
        raise HTTPException(
            status_code=404,
            detail="Horario no encontrado"
        )

    horario.maestro_id = datos.maestro_id
    horario.materia_id = datos.materia_id
    horario.aula_id = datos.aula_id
    horario.dia_semana = datos.dia_semana
    horario.hora_inicio = datos.hora_inicio
    horario.hora_fin = datos.hora_fin

    db.commit()

    return {
        "mensaje": "Horario actualizado correctamente"
    }


@router.patch("/horarios/{horario_id}/estado")
def cambiar_estado_horario(
    horario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("admin"))
):
    horario = db.query(Horario).filter(
        Horario.id == horario_id
    ).first()

    if not horario:
        raise HTTPException(
            status_code=404,
            detail="Horario no encontrado"
        )

    horario.activo = not horario.activo

    db.commit()

    return {
        "mensaje": "Estado actualizado correctamente",
        "activo": horario.activo
    }