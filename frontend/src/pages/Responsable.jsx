import { useEffect, useState } from "react";
import {
  obtenerAsistenciasResponsable,
  obtenerResumenResponsable,
  obtenerHorariosResponsable,
  registrarAsistenciaManual
} from "../services/api";
import "./PanelCRUD.css";
import "./Responsable.css";

const Icon = ({ path, ...props }) => (
  <svg
    width="18"
    height="18"
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
  presente: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </>
      }
    />
  ),
  retardo: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        </>
      }
    />
  ),
  falta: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
        </>
      }
    />
  ),
  total: (
    <Icon
      path={
        <>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
          <path d="M4 19V4.5" />
        </>
      }
    />
  ),
  registrar: <Icon path={<path d="M12 5v14M5 12h14" />} />,
  buscar: (
    <Icon
      path={
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </>
      }
    />
  ),
  limpiar: (
    <Icon
      path={
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
          <path d="M19 6l-.8 13.5A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-2-1.5L5 6" />
        </>
      }
    />
  ),
  logout: (
    <Icon
      path={
        <>
          <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
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
  check: (
    <Icon
      path={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </>
      }
    />
  ),
  tabla: (
    <Icon
      path={
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M9 10v10" />
        </>
      }
    />
  ),
};

function Responsable() {
  const [asistencias, setAsistencias] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [horarios, setHorarios] = useState([]);

  const [horarioSeleccionado, setHorarioSeleccionado] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("PRESENTE");
  const [motivo, setMotivo] = useState("");

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMaestro, setFiltroMaestro] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroAula, setFiltroAula] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError("");

      const [asistenciasData, resumenData, horariosData] = await Promise.all([
        obtenerAsistenciasResponsable(),
        obtenerResumenResponsable(),
        obtenerHorariosResponsable()
      ]);

      setAsistencias(asistenciasData);
      setResumen(resumenData);
      setHorarios(horariosData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // BUSCAR ASISTENCIAS
  // =========================

  const buscarAsistencias = async () => {
    try {
      setError("");

      const datos = await obtenerAsistenciasResponsable({
        fecha: filtroFecha,
        maestro_id: filtroMaestro,
        materia_id: filtroMateria,
        aula_id: filtroAula,
        estado: filtroEstado,
        tipo_registro: filtroTipo
      });

      setAsistencias(datos);
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // LIMPIAR FILTROS
  // =========================

  const limpiarFiltros = async () => {
    setFiltroFecha("");
    setFiltroMaestro("");
    setFiltroMateria("");
    setFiltroAula("");
    setFiltroEstado("");
    setFiltroTipo("");

    try {
      setError("");

      const datos = await obtenerAsistenciasResponsable();

      setAsistencias(datos);
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // REGISTRAR ASISTENCIA MANUAL
  // =========================

  const registrarManual = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!fecha) {
      setError("Selecciona una fecha");
      return;
    }

    const horario = horarios.find((h) => h.id === Number(horarioSeleccionado));

    if (!horario) {
      setError("Selecciona un horario");
      return;
    }

    try {
      await registrarAsistenciaManual({
        horario_id: horario.id,
        aula_id: horario.aula_id,
        fecha,
        estado,
        motivo
      });

      setMensaje("Asistencia registrada correctamente");

      setHorarioSeleccionado("");
      setFecha("");
      setEstado("PRESENTE");
      setMotivo("");

      await cargarDatos();
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    window.location.reload();
  };

  // =========================
  // OPCIONES PARA FILTROS
  // =========================

  const maestros = [
    ...new Map(
      horarios.map((h) => [
        h.maestro_id,
        {
          id: h.maestro_id,
          nombre: h.maestro
        }
      ])
    ).values()
  ];

  const materias = [
    ...new Map(
      horarios.map((h) => [
        h.materia_id,
        {
          id: h.materia_id,
          nombre: h.materia
        }
      ])
    ).values()
  ];

  const aulas = [
    ...new Map(
      horarios.map((h) => [
        h.aula_id,
        {
          id: h.aula_id,
          nombre: h.aula
        }
      ])
    ).values()
  ];

  const badgeClase = (est) => {
    const e = (est || "").toUpperCase();
    if (e === "PRESENTE") return "badge badge-presente";
    if (e === "RETARDO") return "badge badge-retardo";
    if (e === "FALTA") return "badge badge-falta";
    return "badge";
  };

  if (loading) {
    return (
      <div className="responsable-page responsable-centered">
        <div className="state-message">
          <span className="spinner-dark" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responsable-page panel-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Panel del Responsable</h1>
          <p className="page-subtitle">
            Consulta el resumen del día, registra asistencias manuales y filtra el historial
          </p>
        </div>

        <button className="logout-button-outline" onClick={cerrarSesion}>
          {icons.logout}
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div className="state-message state-error">
          <span className="nav-icon">{icons.alerta}</span>
          <p>{error}</p>
        </div>
      )}

      {mensaje && (
        <div className="state-message state-success">
          <span className="nav-icon">{icons.check}</span>
          <p>{mensaje}</p>
        </div>
      )}

      {/* ========================= RESUMEN ========================= */}

      <section className="responsable-section">
        <h2 className="section-title">Resumen del día</h2>

        {resumen && (
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="stat-icon stat-icon-green">{icons.presente}</div>
              <div>
                <p className="stat-label">
                  <span className="badge badge-presente">Presentes</span>
                </p>
                <p className="stat-value">{resumen.presentes}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon stat-icon-amber">{icons.retardo}</div>
              <div>
                <p className="stat-label">
                  <span className="badge badge-retardo">Retardos</span>
                </p>
                <p className="stat-value">{resumen.retardos}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon stat-icon-red">{icons.falta}</div>
              <div>
                <p className="stat-label">
                  <span className="badge badge-falta">Faltas</span>
                </p>
                <p className="stat-value">{resumen.faltas}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon stat-icon-blue">{icons.total}</div>
              <div>
                <p className="stat-label">Total de asistencias</p>
                <p className="stat-value">{resumen.total}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================= REGISTRO MANUAL ========================= */}

      <section className="responsable-section">
        <h2 className="section-title">Registrar asistencia manual</h2>

        <form onSubmit={registrarManual} className="card manual-form">
          <div className="input-group manual-form-full">
            <label>Horario</label>
            <select
              value={horarioSeleccionado}
              onChange={(e) => setHorarioSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un horario</option>

              {horarios.map((horario) => (
                <option key={horario.id} value={horario.id}>
                  {horario.maestro} - {horario.materia} - {horario.aula} -{" "}
                  {horario.dia_semana} {horario.hora_inicio.substring(0, 5)}-
                  {horario.hora_fin.substring(0, 5)}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="PRESENTE">PRESENTE</option>
              <option value="RETARDO">RETARDO</option>
              <option value="FALTA">FALTA</option>
            </select>
          </div>

          <div className="input-group manual-form-full">
            <label>Motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del registro"
            />
          </div>

          <div className="manual-form-full">
            <button type="submit" className="btn-primary">
              {icons.registrar}
              Registrar asistencia
            </button>
          </div>
        </form>
      </section>

      {/* ========================= FILTROS ========================= */}

      <section className="responsable-section">
        <h2 className="section-title">Filtros de asistencia</h2>

        <div className="card filter-panel">
          <div className="input-group">
            <label>Fecha</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Maestro</label>
            <select
              value={filtroMaestro}
              onChange={(e) => setFiltroMaestro(e.target.value)}
            >
              <option value="">Todos los maestros</option>
              {maestros.map((maestro) => (
                <option key={maestro.id} value={maestro.id}>
                  {maestro.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Materia</label>
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
            >
              <option value="">Todas las materias</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Aula</label>
            <select value={filtroAula} onChange={(e) => setFiltroAula(e.target.value)}>
              <option value="">Todas las aulas</option>
              {aulas.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {aula.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="PRESENTE">Presentes</option>
              <option value="RETARDO">Retardos</option>
              <option value="FALTA">Faltas</option>
            </select>
          </div>

          <div className="input-group">
            <label>Tipo de registro</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="QR">QR</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATICO">Automático</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-primary" onClick={buscarAsistencias}>
              {icons.buscar}
              Buscar
            </button>

            <button className="btn-secondary" onClick={limpiarFiltros}>
              {icons.limpiar}
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {/* ========================= TABLA ========================= */}

      <section className="responsable-section">
        <h2 className="section-title">Asistencias registradas</h2>

        {asistencias.length === 0 ? (
          <div className="card empty-state">
            <span className="nav-icon">{icons.tabla}</span>
            <p>No hay asistencias que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Maestro</th>
                  <th>Materia</th>
                  <th>Aula</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Motivo</th>
                </tr>
              </thead>

              <tbody>
                {asistencias.map((asistencia) => (
                  <tr key={asistencia.id}>
                    <td className="cell-strong">{asistencia.maestro}</td>
                    <td>{asistencia.materia}</td>
                    <td>{asistencia.aula}</td>
                    <td>{asistencia.fecha}</td>
                    <td>{asistencia.hora_registro || "-"}</td>
                    <td>
                      <span className={badgeClase(asistencia.estado)}>
                        {asistencia.estado}
                      </span>
                    </td>
                    <td>{asistencia.tipo_registro}</td>
                    <td>{asistencia.motivo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Responsable;