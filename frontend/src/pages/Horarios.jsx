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
  calendario: (
    <Icon
      path={
        <>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
        </>
      }
    />
  ),
  reloj: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        </>
      }
    />
  ),
};

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
      const [horariosData, maestrosData, materiasData, aulasData] =
        await Promise.all([
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
        await actualizarHorario(horarioEditando.id, datos);
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
    <div className="panel-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Horarios</h1>
          <p className="page-subtitle">
            Asigna maestros, materias y aulas por día y horario
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
        >
          {icons.agregar}
          Nuevo horario
        </button>
      </div>

      {error && !mostrarFormulario && (
        <div className="state-message state-error">
          <span className="nav-icon">{icons.alerta}</span>
          <p>{error}</p>
        </div>
      )}

      {mostrarFormulario && (
        <div
          className="modal-overlay"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(false);
          }}
        >
          <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{horarioEditando ? "Editar horario" : "Nuevo horario"}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  limpiarFormulario();
                  setMostrarFormulario(false);
                }}
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
                <label>Maestro</label>
                <select
                  value={maestroId}
                  onChange={(e) => setMaestroId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar maestro</option>
                  {maestros.map((maestro) => (
                    <option key={maestro.id} value={maestro.id}>
                      {maestro.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Materia</label>
                <select
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar materia</option>
                  {materias.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Aula</label>
                <select
                  value={aulaId}
                  onChange={(e) => setAulaId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar aula</option>
                  {aulas.map((aula) => (
                    <option key={aula.id} value={aula.id}>
                      {aula.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Día</label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value)}
                  required
                >
                  <option value="">Seleccionar día</option>
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miércoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sábado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Hora inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Hora fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Guardar
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    limpiarFormulario();
                    setMostrarFormulario(false);
                  }}
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
          <p>Cargando horarios...</p>
        </div>
      ) : horarios.length === 0 ? (
        <div className="card empty-state">
          <span className="nav-icon">{icons.calendario}</span>
          <p>No hay horarios registrados.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
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
                const maestro = maestros.find((m) => m.id === horario.maestro_id);
                const materia = materias.find((m) => m.id === horario.materia_id);
                const aula = aulas.find((a) => a.id === horario.aula_id);

                return (
                  <tr key={horario.id}>
                    <td className="cell-strong">
                      {maestro?.nombre_completo || "—"}
                    </td>
                    <td>{materia?.nombre || "—"}</td>
                    <td>{aula?.nombre || "—"}</td>
                    <td className="cell-capitalize">{horario.dia_semana}</td>
                    <td>
                      <span className="time-cell">
                        {icons.reloj}
                        {horario.hora_inicio.substring(0, 5)}
                        {" - "}
                        {horario.hora_fin.substring(0, 5)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          horario.activo ? "badge-presente" : "badge-falta"
                        }`}
                      >
                        {horario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => editarHorario(horario)}
                          title="Editar"
                        >
                          {icons.editar}
                          Editar
                        </button>

                        <button
                          className={`icon-btn ${
                            horario.activo ? "icon-btn-danger" : "icon-btn-success"
                          }`}
                          onClick={() => cambiarEstado(horario.id)}
                          title={horario.activo ? "Desactivar" : "Activar"}
                        >
                          {horario.activo ? icons.desactivar : icons.activar}
                          {horario.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Horarios;