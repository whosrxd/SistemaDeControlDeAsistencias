import { useEffect, useState } from "react";

// QR
import { QRCodeSVG } from "qrcode.react";

import {
  obtenerAulas,
  crearAula,
  actualizarAula,
  cambiarEstadoAula
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
  aula: (
    <Icon
      path={
        <>
          <path d="M3 21V8l9-5 9 5v13" />
          <path d="M9 21v-7h6v7" />
          <path d="M3 10.5h18" />
        </>
      }
    />
  ),
};

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
        await actualizarAula(aulaEditando.id, datos);
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
    <div className="panel-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Aulas</h1>
          <p className="page-subtitle">Gestiona los salones y su código QR de acceso</p>
        </div>

        <button className="btn-primary" onClick={nuevaAula}>
          {icons.agregar}
          Nueva aula
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
              <h2>{aulaEditando ? "Editar aula" : "Nueva aula"}</h2>
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
                <label>Nombre del aula</label>
                <input
                  type="text"
                  placeholder="Nombre del aula"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {aulaEditando ? "Actualizar" : "Guardar"}
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
          <p>Cargando aulas...</p>
        </div>
      ) : aulas.length === 0 ? (
        <div className="card empty-state">
          <span className="nav-icon">{icons.aula}</span>
          <p>No hay aulas registradas.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
                  <td className="cell-strong">{aula.nombre}</td>
                  <td>
                    <div className="qr-box">
                      <QRCodeSVG value={aula.qr_token} size={72} />
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        aula.activo ? "badge-presente" : "badge-falta"
                      }`}
                    >
                      {aula.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => editarAula(aula)}
                        title="Editar"
                      >
                        {icons.editar}
                        Editar
                      </button>

                      <button
                        className={`icon-btn ${
                          aula.activo ? "icon-btn-danger" : "icon-btn-success"
                        }`}
                        onClick={() => cambiarEstado(aula)}
                        title={aula.activo ? "Desactivar" : "Activar"}
                      >
                        {aula.activo ? icons.desactivar : icons.activar}
                        {aula.activo ? "Desactivar" : "Activar"}
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

export default Aulas;