import uuid

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Aula(Base):
    __tablename__ = "aulas"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    qr_token: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )