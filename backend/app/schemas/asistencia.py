from pydantic import BaseModel
from datetime import date


class RegistrarAsistencia(BaseModel):
    qr_token: str


class RegistrarAsistenciaManual(BaseModel):
    horario_id: int
    aula_id: int
    estado: str
    motivo: str