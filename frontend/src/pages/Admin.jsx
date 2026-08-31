import { useState } from "react";

import Dashboard from "./Dashboard";
import Maestros from "./Maestros";
import Materias from "./Materias";
import Aulas from "./Aulas";
import Horarios from "./Horarios";
import "./Admin.css";

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
  dashboard: (
    <Icon
      path={
        <>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
      }
    />
  ),
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
  horarios: (
    <Icon
      path={
        <>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
          <path d="M12 13v3.2l2.2 1.3" />
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
};

function Admin() {
  const [pagina, setPagina] = useState("dashboard");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    window.location.reload();
  };

  const mostrarPagina = () => {
    switch (pagina) {
      case "dashboard":
        return <Dashboard />;

      case "maestros":
        return <Maestros />;

      case "materias":
        return <Materias />;

      case "aulas":
        return <Aulas />;

      case "horarios":
        return <Horarios />;

      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "maestros", label: "Maestros" },
    { id: "materias", label: "Materias" },
    { id: "aulas", label: "Aulas" },
    { id: "horarios", label: "Horarios" },
  ];

  const irAPagina = (id) => {
    setPagina(id);
    setMenuAbierto(false);
  };

  return (
    <div className="admin-layout">
      {/* TOPBAR (solo móvil) */}
      <header className="admin-topbar">
        <button
          className="menu-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="admin-topbar-title">Administración</span>
      </header>

      {/* OVERLAY MÓVIL */}
      {menuAbierto && (
        <div className="admin-overlay" onClick={() => setMenuAbierto(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${menuAbierto ? "abierto" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Icon
              path={
                <>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </>
              }
            />
          </div>
          <div>
            <h2>Administración</h2>
            <p className="sidebar-subtitle">Control de asistencias</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${pagina === item.id ? "activo" : ""}`}
              onClick={() => irAPagina(item.id)}
            >
              <span className="nav-icon">{icons[item.id]}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={cerrarSesion}>
          <span className="nav-icon">{icons.logout}</span>
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="admin-main">{mostrarPagina()}</main>
    </div>
  );
}

export default Admin;