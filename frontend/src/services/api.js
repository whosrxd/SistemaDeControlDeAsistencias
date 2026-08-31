const API_URL = "/api";

// Login

export async function login(correo, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            correo,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error al iniciar sesión");
    }

    return data;
}

// Maestros

export async function obtenerMaestros() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/maestros`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("No se pudieron obtener los maestros");
    }

    return response.json();
}

export async function crearMaestro(maestro) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/maestros`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(maestro),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo crear el maestro");
    }

    return data;
}

export async function actualizarMaestro(id, maestro) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/maestros/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(maestro),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo actualizar el maestro");
    }

    return data;
}

export async function cambiarEstadoMaestro(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/admin/maestros/${id}/estado`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudo cambiar el estado"
        );
    }

    return data;
}

// Materias

export async function obtenerMaterias() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/materias`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudieron obtener las materias");
    }

    return data;
}


export async function crearMateria(materia) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/materias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materia),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo crear la materia");
    }

    return data;
}


export async function actualizarMateria(id, materia) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/materias/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materia),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo actualizar la materia");
    }

    return data;
}


export async function cambiarEstadoMateria(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/admin/materias/${id}/estado`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo cambiar el estado");
    }

    return data;
}

// Aulas

export async function obtenerAulas() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/aulas`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudieron obtener las aulas");
    }

    return data;
}


export async function crearAula(aula) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/aulas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(aula),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo crear el aula");
    }

    return data;
}


export async function actualizarAula(id, aula) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/aulas/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(aula),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo actualizar el aula");
    }

    return data;
}


export async function cambiarEstadoAula(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/admin/aulas/${id}/estado`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo cambiar el estado");
    }

    return data;
}

// Horarios

export async function obtenerHorarios() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/horarios`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("No se pudieron obtener los horarios");
    }

    return response.json();
}

export async function crearHorario(datos) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/horarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error al crear el horario");
    }

    return data;
}

export async function actualizarHorario(id, datos) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/horarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error al actualizar el horario");
    }

    return data;
}

export async function cambiarEstadoHorario(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/horarios/${id}/estado`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error al cambiar el estado");
    }

    return data;
}

export async function obtenerPerfilMaestro() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/maestro/perfil`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudo obtener el perfil"
        );
    }

    return data;
}


export async function obtenerHorariosMaestro() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/maestro/horarios`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudieron obtener los horarios"
        );
    }

    return data;
}

export async function registrarAsistencia(qr_token) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/maestro/asistencia`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            qr_token,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error al registrar asistencia");
    }

    return data;
}

export async function obtenerResumenResponsable() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/responsable/resumen`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudo obtener el resumen"
        );
    }

    return data;
}

export async function obtenerHorariosResponsable() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/responsable/horarios`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudieron obtener los horarios"
        );
    }

    return data;
}

export async function registrarAsistenciaManual(datos) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/responsable/asistencia`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(datos),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudo registrar la asistencia"
        );
    }

    return data;
}

export const obtenerAsistenciasResponsable = async (filtros = {}) => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (filtros.fecha) {
        params.append("fecha", filtros.fecha);
    }

    if (filtros.maestro_id) {
        params.append("maestro_id", filtros.maestro_id);
    }

    if (filtros.materia_id) {
        params.append("materia_id", filtros.materia_id);
    }

    if (filtros.aula_id) {
        params.append("aula_id", filtros.aula_id);
    }

    if (filtros.estado) {
        params.append("estado", filtros.estado);
    }

    if (filtros.tipo_registro) {
        params.append("tipo_registro", filtros.tipo_registro);
    }

    const query = params.toString();

    const response = await fetch(
        `${API_URL}/responsable/asistencias${query ? `?${query}` : ""}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Error al obtener asistencias"
        );
    }

    return data;
};

export async function obtenerAsistenciasMaestro() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/maestro/asistencias`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudieron obtener las asistencias"
        );
    }

    return data;
}

// Dashboard
export async function obtenerDashboard() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "No se pudo obtener el dashboard"
        );
    }

    return data;
}