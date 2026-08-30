import { useEffect, useState } from "react";
import {
    obtenerPerfilMaestro,
    obtenerHorariosMaestro
} from "../services/api";

function Maestro() {

    const [perfil, setPerfil] = useState(null);
    const [horarios, setHorarios] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [perfilData, horariosData] = await Promise.all([
                obtenerPerfilMaestro(),
                obtenerHorariosMaestro()
            ]);

            setPerfil(perfilData);
            setHorarios(horariosData);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");

        window.location.reload();
    };

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <div>

            <h1>Panel del Maestro</h1>

            {error && (
                <p>{error}</p>
            )}

            {perfil && (
                <div>
                    <h2>Bienvenido, {perfil.nombre}</h2>

                    <p>
                        Número de empleado:{" "}
                        {perfil.numero_empleado}
                    </p>

                    <p>
                        Correo: {perfil.correo}
                    </p>
                </div>
            )}

            <hr />

            <h2>Mis horarios</h2>

            {horarios.length === 0 ? (
                <p>No tienes horarios asignados.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Materia</th>
                            <th>Aula</th>
                            <th>Día</th>
                            <th>Horario</th>
                        </tr>
                    </thead>

                    <tbody>
                        {horarios.map((horario) => (
                            <tr key={horario.id}>
                                <td>{horario.materia}</td>

                                <td>{horario.aula}</td>

                                <td>{horario.dia_semana}</td>

                                <td>
                                    {horario.hora_inicio.substring(0, 5)}
                                    {" - "}
                                    {horario.hora_fin.substring(0, 5)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <br />

            <button onClick={cerrarSesion}>
                Cerrar sesión
            </button>

        </div>
    );
}

export default Maestro;