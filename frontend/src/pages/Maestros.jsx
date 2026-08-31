import { useEffect, useState } from "react";
import {
  obtenerMaestros,
  crearMaestro,
  actualizarMaestro,
  cambiarEstadoMaestro
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
};

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
        await actualizarMaestro(maestroEditando.id, datos);
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
    <div className="maestros-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Maestros</h1>
          <p className="page-subtitle">Gestiona el personal docente registrado</p>
        </div>

        <button className="btn-primary" onClick={nuevoMaestro}>
          {icons.agregar}
          Nuevo maestro
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
              <h2>{maestroEditando ? "Editar maestro" : "Nuevo maestro"}</h2>
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
                <label>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Número de empleado</label>
                <input
                  type="text"
                  placeholder="Número de empleado"
                  value={numeroEmpleado}
                  onChange={(e) => setNumeroEmpleado(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Correo</label>
                <input
                  type="email"
                  placeholder="Correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  {maestroEditando ? "Nueva contraseña (opcional)" : "Contraseña"}
                </label>
                <input
                  type="password"
                  placeholder={
                    maestroEditando ? "Nueva contraseña (opcional)" : "Contraseña"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!maestroEditando}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {maestroEditando ? "Actualizar" : "Guardar"}
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
          <p>Cargando maestros...</p>
        </div>
      ) : maestros.length === 0 ? (
        <div className="card empty-state">
          <p>No hay maestros registrados.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
                  <td className="cell-strong">{maestro.nombre_completo}</td>
                  <td>{maestro.numero_empleado}</td>
                  <td>{maestro.correo}</td>
                  <td>
                    <span
                      className={`badge ${
                        maestro.activo ? "badge-presente" : "badge-falta"
                      }`}
                    >
                      {maestro.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => editarMaestro(maestro)}
                        title="Editar"
                      >
                        {icons.editar}
                        Editar
                      </button>

                      <button
                        className={`icon-btn ${
                          maestro.activo ? "icon-btn-danger" : "icon-btn-success"
                        }`}
                        onClick={() => cambiarEstado(maestro)}
                        title={maestro.activo ? "Desactivar" : "Activar"}
                      >
                        {maestro.activo ? icons.desactivar : icons.activar}
                        {maestro.activo ? "Desactivar" : "Activar"}
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

export default Maestros;