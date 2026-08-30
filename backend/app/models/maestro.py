from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Maestro(Base):
    __tablename__ = "maestros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        unique=True,
        nullable=False
    )
    numero_empleado = Column(String(50), unique=True, nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    usuario = relationship("Usuario", back_populates="maestro")