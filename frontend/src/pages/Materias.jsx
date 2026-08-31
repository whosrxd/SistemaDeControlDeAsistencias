import { useEffect, useState } from "react";

import {
  obtenerMaterias,
  crearMateria,
  actualizarMateria,
  cambiarEstadoMateria
} from "../services/api";
import "./PanelCRUD.css";

const Icon = ({ path, ...props }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {path}
  </svg>
);

const icons = {
  agregar: <Icon path={<path d="M12 5v14M5 12h14" />} />,
  editar: (
    <Icon
      path={
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </>
      }
    />
  ),
  activar: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </>
      }
    />
  ),
  desactivar: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
        </>
      }
    />
  ),
  cerrar: (
    <Icon
      path={
        <>
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </>
      }
    />
  ),
  alerta: (
    <Icon
      path={
        <>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9L2.7 17.5A1.8 1.8 0 0 0 4.3 20h15.4a1.8 1.8 0 0 0 1.6-2.6L13.7 3.9a1.8 1.8 0 0 0-3.4 0z" />
        </>
      }
    />
  ),
  libro: (
    <Icon
      path={
        <>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
          <path d="M4 19V4.5" />
        </>
      }
    />
  ),
};

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
        await actualizarMateria(materiaEditando.id, datos);
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
    <div className="panel-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Materias</h1>
          <p className="page-subtitle">Gestiona las materias del plan académico</p>
        </div>

        <button className="btn-primary" onClick={nuevaMateria}>
          {icons.agregar}
          Nueva materia
        </button>
      </div>

      {error && !mostrarFormulario && (
        <div className="state-message state-error">
          <span className="nav-icon">{icons.alerta}</span>
          <p>{error}</p>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={cancelarFormulario}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{materiaEditando ? "Editar materia" : "Nueva materia"}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={cancelarFormulario}
                aria-label="Cerrar"
              >
                {icons.cerrar}
              </button>
            </div>

            {error && (
              <div className="state-message state-error modal-error">
                <span className="nav-icon">{icons.alerta}</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Nombre de la materia</label>
                <input
                  type="text"
                  placeholder="Nombre de la materia"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Clave de la materia</label>
                <input
                  type="text"
                  placeholder="Clave de la materia"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {materiaEditando ? "Actualizar" : "Guardar"}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="state-message">
          <span className="spinner-dark" />
          <p>Cargando materias...</p>
        </div>
      ) : materias.length === 0 ? (
        <div className="card empty-state">
          <span className="nav-icon">{icons.libro}</span>
          <p>No hay materias registradas.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
                  <td className="cell-strong">{materia.nombre}</td>
                  <td>{materia.clave}</td>
                  <td>
                    <span
                      className={`badge ${
                        materia.activo ? "badge-presente" : "badge-falta"
                      }`}
                    >
                      {materia.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => editarMateria(materia)}
                        title="Editar"
                      >
                        {icons.editar}
                        Editar
                      </button>

                      <button
                        className={`icon-btn ${
                          materia.activo ? "icon-btn-danger" : "icon-btn-success"
                        }`}
                        onClick={() => cambiarEstado(materia)}
                        title={materia.activo ? "Desactivar" : "Activar"}
                      >
                        {materia.activo ? icons.desactivar : icons.activar}
                        {materia.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Materias;