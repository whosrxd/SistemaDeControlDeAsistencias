import { useEffect, useState } from "react";

import {
    obtenerMaterias,
    crearMateria,
    actualizarMateria,
    cambiarEstadoMateria
} from "../services/api";


function Materias() {
    const [materias, setMaterias] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [materiaEditando, setMateriaEditando] = useState(null);

    const [nombre, setNombre] = useState("");
    const [clave, setClave] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        cargarMaterias();
    }, []);


    const cargarMaterias = async () => {
        try {
            const data = await obtenerMaterias();
            setMaterias(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const nuevaMateria = () => {
        setNombre("");
        setClave("");

        setMateriaEditando(null);
        setMostrarFormulario(true);
        setError("");
    };


    const editarMateria = (materia) => {
        setNombre(materia.nombre);
        setClave(materia.clave);

        setMateriaEditando(materia);
        setMostrarFormulario(true);
        setError("");
    };


    const cancelarFormulario = () => {
        setNombre("");
        setClave("");

        setMateriaEditando(null);
        setMostrarFormulario(false);
        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const datos = {
                nombre,
                clave
            };

            if (materiaEditando) {
                await actualizarMateria(
                    materiaEditando.id,
                    datos
                );
            } else {
                await crearMateria(datos);
            }

            cancelarFormulario();

            await cargarMaterias();

        } catch (error) {
            setError(error.message);
        }
    };


    const cambiarEstado = async (materia) => {
        try {
            await cambiarEstadoMateria(materia.id);
            await cargarMaterias();
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <div>

            <h1>Materias</h1>

            <button onClick={nuevaMateria}>
                + Nueva materia
            </button>


            {error && (
                <p>{error}</p>
            )}


            {mostrarFormulario && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {materiaEditando
                            ? "Editar materia"
                            : "Nueva materia"}
                    </h2>


                    <input
                        type="text"
                        placeholder="Nombre de la materia"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                        required
                    />


                    <input
                        type="text"
                        placeholder="Clave de la materia"
                        value={clave}
                        onChange={(e) =>
                            setClave(e.target.value)
                        }
                        required
                    />


                    <button type="submit">
                        {materiaEditando
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

                <p>Cargando materias...</p>

            ) : (

                <table>

                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Clave</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>


                    <tbody>

                        {materias.map((materia) => (

                            <tr key={materia.id}>

                                <td>
                                    {materia.nombre}
                                </td>

                                <td>
                                    {materia.clave}
                                </td>

                                <td>
                                    {materia.activo
                                        ? "Activo"
                                        : "Inactivo"}
                                </td>

                                <td>

                                    <button
                                        onClick={() =>
                                            editarMateria(materia)
                                        }
                                    >
                                        Editar
                                    </button>


                                    <button
                                        onClick={() =>
                                            cambiarEstado(materia)
                                        }
                                    >
                                        {materia.activo
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


export default Materias;