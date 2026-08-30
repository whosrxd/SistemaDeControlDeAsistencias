import { useEffect, useState } from "react";

// QR
import { QRCodeSVG } from "qrcode.react";

import {
    obtenerAulas,
    crearAula,
    actualizarAula,
    cambiarEstadoAula
} from "../services/api";


function Aulas() {
    const [aulas, setAulas] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [aulaEditando, setAulaEditando] = useState(null);

    const [nombre, setNombre] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        cargarAulas();
    }, []);


    const cargarAulas = async () => {
        try {
            const data = await obtenerAulas();
            setAulas(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const nuevaAula = () => {
        setNombre("");
        setAulaEditando(null);
        setMostrarFormulario(true);
        setError("");
    };


    const editarAula = (aula) => {
        setNombre(aula.nombre);

        setAulaEditando(aula);
        setMostrarFormulario(true);
        setError("");
    };


    const cancelarFormulario = () => {
        setNombre("");
        setAulaEditando(null);
        setMostrarFormulario(false);
        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const datos = {
                nombre
            };

            if (aulaEditando) {
                await actualizarAula(
                    aulaEditando.id,
                    datos
                );
            } else {
                await crearAula(datos);
            }

            cancelarFormulario();

            await cargarAulas();

        } catch (error) {
            setError(error.message);
        }
    };


    const cambiarEstado = async (aula) => {
        try {
            await cambiarEstadoAula(aula.id);
            await cargarAulas();
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <div>

            <h1>Aulas</h1>

            <button onClick={nuevaAula}>
                + Nueva aula
            </button>


            {error && (
                <p>{error}</p>
            )}


            {mostrarFormulario && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {aulaEditando
                            ? "Editar aula"
                            : "Nueva aula"}
                    </h2>


                    <input
                        type="text"
                        placeholder="Nombre del aula"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                        required
                    />


                    <button type="submit">
                        {aulaEditando
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

                <p>Cargando aulas...</p>

            ) : (

                <table>

                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>QR Token</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>


                    <tbody>

                        {aulas.map((aula) => (

                            <tr key={aula.id}>

                                <td>
                                    {aula.nombre}
                                </td>

                                <td>
                                    <QRCodeSVG
                                        value={aula.qr_token}
                                        size={100}
                                    />
                                </td>

                                <td>
                                    {aula.activo
                                        ? "Activo"
                                        : "Inactivo"}
                                </td>

                                <td>

                                    <button
                                        onClick={() =>
                                            editarAula(aula)
                                        }
                                    >
                                        Editar
                                    </button>


                                    <button
                                        onClick={() =>
                                            cambiarEstado(aula)
                                        }
                                    >
                                        {aula.activo
                                            ? "Desactivar"
                                            : "Activar"}
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


export default Aulas;