from pydantic import BaseModel


class MateriaCrear(BaseModel):
    nombre: str
    clave: str


class MateriaActualizar(BaseModel):
    nombre: str
    clave: str