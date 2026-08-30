from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Materia(Base):
    __tablename__ = "materias"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    nombre: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    clave: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )