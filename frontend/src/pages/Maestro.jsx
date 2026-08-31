import { useEffect, useState } from "react";
import {
  obtenerPerfilMaestro,
  obtenerHorariosMaestro,
  obtenerAsistenciasMaestro
} from "../services/api";

import Asistencia from "./Asistencia";
import "./PanelCRUD.css";
import "./Maestro.css";

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
  volver: <Icon path={<path d="M15 18l-6-6 6-6" />} />,
  qr: (
    <Icon
      path={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v3M17 20h3" />
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
  usuario: (
    <Icon
      path={
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
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

const badgeClase = (estado) => {
  const e = (estado || "").toUpperCase();
  if (e === "PRESENTE") return "badge badge-presente";
  if (e === "RETARDO") return "badge badge-retardo";
  if (e === "FALTA") return "badge badge-falta";
  return "badge";
};

function Maestro() {
  const [perfil, setPerfil] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [asistencias, setAsistencias] = useState([]);

  const [mostrarAsistencia, setMostrarAsistencia] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [perfilData, horariosData, asistenciasData] = await Promise.all([
        obtenerPerfilMaestro(),
        obtenerHorariosMaestro(),
        obtenerAsistenciasMaestro()
      ]);

      setPerfil(perfilData);
      setHorarios(horariosData);
      setAsistencias(asistenciasData);
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
    return (
      <div className="maestro-page maestro-centered">
        <div className="state-message">
          <span className="spinner-dark" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de asistencia
  if (mostrarAsistencia) {
    return (
      <div className="maestro-page">
        <div className="maestro-topbar">
          <button
            className="btn-secondary btn-back"
            onClick={() => setMostrarAsistencia(false)}
          >
            {icons.volver}
            Volver al panel
          </button>
        </div>

        <Asistencia />
      </div>
    );
  }

  return (
    <div className="maestro-page">
      <header className="maestro-header">
        <div>
          <h1>Panel del Maestro</h1>
          <p className="maestro-subtitle">
            Consulta tu información, horarios y asistencias
          </p>
        </div>

        <button className="logout-button-outline" onClick={cerrarSesion}>
          {icons.logout}
          Cerrar sesión
        </button>
      </header>

      {error && (
        <div className="state-message state-error">
          <span className="nav-icon">{icons.alerta}</span>
          <p>{error}</p>
        </div>
      )}

      {perfil && (
        <div className="card profile-card">
          <div className="profile-avatar">{icons.usuario}</div>
          <div>
            <h2 className="profile-name">{perfil.nombre}</h2>
            <p className="profile-detail">
              Número de empleado: <strong>{perfil.numero_empleado}</strong>
            </p>
            <p className="profile-detail">Correo: {perfil.correo}</p>
          </div>
        </div>
      )}

      <section className="maestro-section">
        <h2 className="section-title">Mis horarios</h2>

        {horarios.length === 0 ? (
          <div className="card empty-state">
            <p>No tienes horarios asignados.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
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
                    <td data-label="Materia" className="cell-strong">
                      {horario.materia}
                    </td>
                    <td data-label="Aula">{horario.aula}</td>
                    <td data-label="Día" className="cell-capitalize">
                      {horario.dia_semana}
                    </td>
                    <td data-label="Horario">
                      <span className="time-cell">
                        {icons.reloj}
                        {horario.hora_inicio.substring(0, 5)}
                        {" - "}
                        {horario.hora_fin.substring(0, 5)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="maestro-section">
        <h2 className="section-title">Mis asistencias</h2>

        {asistencias.length === 0 ? (
          <div className="card empty-state">
            <p>No tienes asistencias registradas.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
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
                    <td data-label="Materia" className="cell-strong">
                      {asistencia.materia}
                    </td>
                    <td data-label="Aula">{asistencia.aula}</td>
                    <td data-label="Fecha">{asistencia.fecha}</td>
                    <td data-label="Hora">{asistencia.hora_registro || "-"}</td>
                    <td data-label="Estado">
                      <span className={badgeClase(asistencia.estado)}>
                        {asistencia.estado}
                      </span>
                    </td>
                    <td data-label="Tipo">{asistencia.tipo_registro}</td>
                    <td data-label="Motivo">{asistencia.motivo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="maestro-actions">
        <button
          className="btn-primary btn-qr"
          onClick={() => setMostrarAsistencia(true)}
        >
          {icons.qr}
          Escanear QR
        </button>
      </div>
    </div>
  );
}

export default Maestro;