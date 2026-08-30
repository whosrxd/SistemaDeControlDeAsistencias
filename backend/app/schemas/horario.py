from pydantic import BaseModel
from datetime import time


class HorarioCrear(BaseModel):
    maestro_id: int
    materia_id: int
    aula_id: int
    dia_semana: str
    hora_inicio: time
    hora_fin: time


class HorarioActualizar(BaseModel):
    maestro_id: int
    materia_id: int
    aula_id: int
    dia_semana: str
    hora_inicio: time
    hora_fin: time