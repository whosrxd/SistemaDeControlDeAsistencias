from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, datetime

from app.database import Base


class Asistencia(Base):
    __tablename__ = "asistencias"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    horario_id: Mapped[int] = mapped_column(
        ForeignKey("horarios.id"),
        nullable=False
    )

    aula_id: Mapped[int] = mapped_column(
        ForeignKey("aulas.id"),
        nullable=False
    )

    fecha: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    hora_registro: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    estado: Mapped[str] = mapped_column(
        Enum(
            "PRESENTE",
            "RETARDO",
            "FALTA"
        ),
        nullable=False
    )

    tipo_registro: Mapped[str] = mapped_column(
        Enum(
            "QR",
            "MANUAL",
            "AUTOMATICO"
        ),
        nullable=False
    )

    motivo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    responsable_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )
    
    horario = relationship("Horario")
    aula = relationship("Aula")