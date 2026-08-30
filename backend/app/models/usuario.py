from sqlalchemy import String, Boolean, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    nombre: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    correo: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    rol: Mapped[str] = mapped_column(
        Enum("admin", "responsable", "maestro"),
        nullable=False
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )

    maestro = relationship(
        "Maestro",
        back_populates="usuario",
        uselist=False
    )