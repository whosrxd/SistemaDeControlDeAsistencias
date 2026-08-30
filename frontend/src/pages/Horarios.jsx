import { useEffect, useState } from "react";

import {
    obtenerHorarios,
    crearHorario,
    actualizarHorario,
    cambiarEstadoHorario,
    obtenerMaestros,
    obtenerMaterias,
    obtenerAulas
} from "../services/api";

function Horarios() {

    const [horarios, setHorarios] = useState([]);
    const [maestros, setMaestros] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [aulas, setAulas] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [horarioEditando, setHorarioEditando] = useState(null);

    const [maestroId, setMaestroId] = useState("");
    const [materiaId, setMateriaId] = useState("");
    const [aulaId, setAulaId] = useState("");
    const [diaSemana, setDiaSemana] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [
                horariosData,
                maestrosData,
                materiasData,
                aulasData
            ] = await Promise.all([
                obtenerHorarios(),
                obtenerMaestros(),
                obtenerMaterias(),
                obtenerAulas()
            ]);

            setHorarios(horariosData);
            setMaestros(maestrosData);
            setMaterias(materiasData);
            setAulas(aulasData);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setMaestroId("");
        setMateriaId("");
        setAulaId("");
        setDiaSemana("");
        setHoraInicio("");
        setHoraFin("");
        setHorarioEditando(null);
    };

    const editarHorario = (horario) => {

        setMaestroId(horario.maestro_id);
        setMateriaId(horario.materia_id);
        setAulaId(horario.aula_id);
        setDiaSemana(horario.dia_semana);

        setHoraInicio(horario.hora_inicio.substring(0, 5));
        setHoraFin(horario.hora_fin.substring(0, 5));

        setHorarioEditando(horario);
        setMostrarFormulario(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const datos = {
            maestro_id: Number(maestroId),
            materia_id: Number(materiaId),
            aula_id: Number(aulaId),
            dia_semana: diaSemana,
            hora_inicio: horaInicio,
            hora_fin: horaFin
        };

        try {

            if (horarioEditando) {
                await actualizarHorario(
                    horarioEditando.id,
                    datos
                );
            } else {
                await crearHorario(datos);
            }

            limpiarFormulario();
            setMostrarFormulario(false);

            await cargarDatos();

        } catch (error) {
            setError(error.message);
        }
    };

    const cambiarEstado = async (id) => {

        try {
            await cambiarEstadoHorario(id);
            await cargarDatos();

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>

            <h1>Horarios</h1>

            <button
                onClick={() => {
                    limpiarFormulario();
                    setMostrarFormulario(true);
                }}
            >
                + Nuevo horario
            </button>

            {error && (
                <p>{error}</p>
            )}

            {mostrarFormulario && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {horarioEditando
                            ? "Editar horario"
                            : "Nuevo horario"}
                    </h2>

                    <select
                        value={maestroId}
                        onChange={(e) =>
                            setMaestroId(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Seleccionar maestro
                        </option>

                        {maestros.map((maestro) => (
                            <option
                                key={maestro.id}
                                value={maestro.id}
                            >
                                {maestro.nombre_completo}
                            </option>
                        ))}
                    </select>

                    <select
                        value={materiaId}
                        onChange={(e) =>
                            setMateriaId(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Seleccionar materia
                        </option>

                        {materias.map((materia) => (
                            <option
                                key={materia.id}
                                value={materia.id}
                            >
                                {materia.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        value={aulaId}
                        onChange={(e) =>
                            setAulaId(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Seleccionar aula
                        </option>

                        {aulas.map((aula) => (
                            <option
                                key={aula.id}
                                value={aula.id}
                            >
                                {aula.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        value={diaSemana}
                        onChange={(e) =>
                            setDiaSemana(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Seleccionar día
                        </option>

                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miércoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sábado">Sábado</option>
                    </select>

                    <input
                        type="time"
                        value={horaInicio}
                        onChange={(e) =>
                            setHoraInicio(e.target.value)
                        }
                        required
                    />

                    <input
                        type="time"
                        value={horaFin}
                        onChange={(e) =>
                            setHoraFin(e.target.value)
                        }
                        required
                    />

                    <button type="submit">
                        Guardar
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            limpiarFormulario();
                            setMostrarFormulario(false);
                        }}
                    >
                        Cancelar
                    </button>

                </form>
            )}

            {loading ? (
                <p>Cargando horarios...</p>
            ) : (

                <table>

                    <thead>
                        <tr>
                            <th>Maestro</th>
                            <th>Materia</th>
                            <th>Aula</th>
                            <th>Día</th>
                            <th>Horario</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        {horarios.map((horario) => {

                            const maestro = maestros.find(
                                m => m.id === horario.maestro_id
                            );

                            const materia = materias.find(
                                m => m.id === horario.materia_id
                            );

                            const aula = aulas.find(
                                a => a.id === horario.aula_id
                            );

                            return (
                                <tr key={horario.id}>

                                    <td>
                                        {maestro?.nombre_completo || "—"}
                                    </td>

                                    <td>
                                        {materia?.nombre || "—"}
                                    </td>

                                    <td>
                                        {aula?.nombre || "—"}
                                    </td>

                                    <td>
                                        {horario.dia_semana}
                                    </td>

                                    <td>
                                        {horario.hora_inicio.substring(0, 5)}
                                        {" - "}
                                        {horario.hora_fin.substring(0, 5)}
                                    </td>

                                    <td>
                                        {horario.activo
                                            ? "Activo"
                                            : "Inactivo"}
                                    </td>

                                    <td>

                                        <button
                                            onClick={() =>
                                                editarHorario(horario)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() =>
                                                cambiarEstado(horario.id)
                                            }
                                        >
                                            {horario.activo
                                                ? "Desactivar"
                                                : "Activar"}
                                        </button>

                                    </td>

                                </tr>
                            );
                        })}

                    </tbody>

                </table>
            )}

        </div>
    );
}

export default Horarios;