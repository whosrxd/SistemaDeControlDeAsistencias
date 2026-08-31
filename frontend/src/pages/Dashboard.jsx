import { useEffect, useState } from "react";
import { obtenerDashboard } from "../services/api";
import "./Admin.css";

const Icon = ({ path, ...props }) => (
  <svg
    width="20"
    height="20"
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
  maestros: (
    <Icon
      path={
        <>
          <circle cx="9" cy="7" r="3.5" />
          <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
          <path d="M16 4.5c1.7.3 3 1.8 3 3.6 0 1.8-1.3 3.3-3 3.6" />
          <path d="M19 13.5c2 .5 3.5 2.3 3.5 4.5" />
        </>
      }
    />
  ),
  materias: (
    <Icon
      path={
        <>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
          <path d="M4 19V4.5" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
        </>
      }
    />
  ),
  aulas: (
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

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const data = await obtenerDashboard();
        setDatos(data);
      } catch (error) {
        setError(error.message);
      }
    };

    cargarDashboard();
  }, []);

  if (error) {
    return (
      <div className="state-message state-error">
        <span className="nav-icon">{icons.alerta}</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="state-message">
        <span className="spinner-dark" />
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <section className="dashboard">
      <div className="dashboard-group">
        <h2 className="dashboard-group-title">Resumen general</h2>
        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-icon stat-icon-blue">{icons.maestros}</div>
            <div>
              <p className="stat-label">Maestros</p>
              <p className="stat-value">{datos.maestros}</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon stat-icon-blue">{icons.materias}</div>
            <div>
              <p className="stat-label">Materias</p>
              <p className="stat-value">{datos.materias}</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon stat-icon-blue">{icons.aulas}</div>
            <div>
              <p className="stat-label">Aulas</p>
              <p className="stat-value">{datos.aulas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-group">
        <h2 className="dashboard-group-title">Asistencias de hoy</h2>
        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-icon stat-icon-green">{icons.presente}</div>
            <div>
              <p className="stat-label">
                <span className="badge badge-presente">Presentes</span>
              </p>
              <p className="stat-value">{datos.asistencias_hoy.presentes}</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon stat-icon-amber">{icons.retardo}</div>
            <div>
              <p className="stat-label">
                <span className="badge badge-retardo">Retardos</span>
              </p>
              <p className="stat-value">{datos.asistencias_hoy.retardos}</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon stat-icon-red">{icons.falta}</div>
            <div>
              <p className="stat-label">
                <span className="badge badge-falta">Faltas</span>
              </p>
              <p className="stat-value">{datos.asistencias_hoy.faltas}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;