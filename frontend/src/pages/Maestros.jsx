import { useEffect, useState } from "react";
import {
    obtenerMaestros,
    crearMaestro,
    actualizarMaestro,
    cambiarEstadoMaestro
} from "../services/api";

function Maestros() {
    const [maestros, setMaestros] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [maestroEditando, setMaestroEditando] = useState(null);

    const [nombre, setNombre] = useState("");
    const [numeroEmpleado, setNumeroEmpleado] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarMaestros();
    }, []);

    const cargarMaestros = async () => {
        try {
            const data = await obtenerMaestros();
            setMaestros(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const editarMaestro = (maestro) => {
        setNombre(maestro.nombre_completo);
        setNumeroEmpleado(maestro.numero_empleado);
        setCorreo(maestro.correo);
        setPassword("");

        setMaestroEditando(maestro);
        setMostrarFormulario(true);
        setError("");
    };

    const nuevoMaestro = () => {
        setNombre("");
        setNumeroEmpleado("");
        setCorreo("");
        setPassword("");

        setMaestroEditando(null);
        setMostrarFormulario(true);
        setError("");
    };

    const cambiarEstado = async (maestro) => {
        try {
            await cambiarEstadoMaestro(maestro.id);
            await cargarMaestros();
        } catch (error) {
            setError(error.message);
        }
    };

    const cancelarFormulario = () => {
        setNombre("");
        setNumeroEmpleado("");
        setCorreo("");
        setPassword("");

        setMaestroEditando(null);
        setMostrarFormulario(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const datos = {
                nombre_completo: nombre,
                numero_empleado: numeroEmpleado,
                correo: correo,
            };

            // Si estamos editando y se escribió una contraseña,
            // también se envía para actualizarla.
            if (password) {
                datos.password = password;
            }

            if (maestroEditando) {
                await actualizarMaestro(
                    maestroEditando.id,
                    datos
                );
            } else {
                await crearMaestro({
                    ...datos,
                    password: password,
                });
            }

            cancelarFormulario();
            await cargarMaestros();

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h1>Maestros</h1>

            <button onClick={nuevoMaestro}>
                + Nuevo maestro
            </button>

            {error && <p>{error}</p>}

            {mostrarFormulario && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {maestroEditando
                            ? "Editar maestro"
                            : "Nuevo maestro"}
                    </h2>

                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Número de empleado"
                        value={numeroEmpleado}
                        onChange={(e) =>
                            setNumeroEmpleado(e.target.value)
                        }
                        required
                    />

                    <input
                        type="email"
                        placeholder="Correo"
                        value={correo}
                        onChange={(e) =>
                            setCorreo(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder={
                            maestroEditando
                                ? "Nueva contraseña (opcional)"
                                : "Contraseña"
                        }
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required={!maestroEditando}
                    />

                    <button type="submit">
                        {maestroEditando
                            ? "Actualizar"
                            : "Guardar"}
                    </button>

                    <button
                        type="button"
                        onClick={cancelarFormulario}
                    >
                        Cancelar
                    </button>

                </form>
            )}

            {loading ? (
                <p>Cargando maestros...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>No. empleado</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {maestros.map((maestro) => (
                            <tr key={maestro.id}>
                                <td>
                                    {maestro.nombre_completo}
                                </td>

                                <td>
                                    {maestro.numero_empleado}
                                </td>

                                <td>
                                    {maestro.correo}
                                </td>

                                <td>
                                    {maestro.activo
                                        ? "Activo"
                                        : "Inactivo"}
                                </td>

                                <td>
                                    <button
                                        onClick={() => editarMaestro(maestro)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => cambiarEstado(maestro)}
                                    >
                                        {maestro.activo ? "Desactivar" : "Activar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Maestros;