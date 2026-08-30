from pydantic import BaseModel


class AulaCrear(BaseModel):
    nombre: str


class AulaActualizar(BaseModel):
    nombre: str