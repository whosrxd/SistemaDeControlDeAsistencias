from pydantic import BaseModel


class MaestroCrear(BaseModel):
    nombre_completo: str
    numero_empleado: str
    correo: str
    password: str


class MaestroActualizar(BaseModel):
    nombre_completo: str
    numero_empleado: str
    correo: str
    password: str | None = None