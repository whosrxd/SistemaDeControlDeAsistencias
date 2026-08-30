from sqlalchemy import String, Boolean, Enum, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import time

from app.database import Base


class Horario(Base):
    __tablename__ = "horarios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    maestro_id: Mapped[int] = mapped_column(
        ForeignKey("maestros.id"),
        nullable=False
    )

    materia_id: Mapped[int] = mapped_column(
        ForeignKey("materias.id"),
        nullable=False
    )

    aula_id: Mapped[int] = mapped_column(
        ForeignKey("aulas.id"),
        nullable=False
    )

    dia_semana: Mapped[str] = mapped_column(
        Enum(
            "lunes",
            "martes",
            "miércoles",
            "jueves",
            "viernes",
            "sábado"
        ),
        nullable=False
    )

    hora_inicio: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    hora_fin: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    maestro = relationship("Maestro")
    materia = relationship("Materia")
    aula = relationship("Aula")