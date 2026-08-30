import { useEffect, useState } from "react";

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://127.0.0.1:8000/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "No se pudo obtener el dashboard");
        }

        setDatos(data);
      } catch (error) {
        setError(error.message);
      }
    };

    obtenerDashboard();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!datos) {
    return <p>Cargando información...</p>;
  }

  return (
    <section>
      <h2>Dashboard</h2>

      <div>
        <div>
          <h3>Maestros</h3>
          <p>{datos.maestros}</p>
        </div>

        <div>
          <h3>Materias</h3>
          <p>{datos.materias}</p>
        </div>

        <div>
          <h3>Aulas</h3>
          <p>{datos.aulas}</p>
        </div>
      </div>

      <h2>Asistencias de hoy</h2>

      <div>
        <div>
          <h3>Presentes</h3>
          <p>{datos.asistencias_hoy.presentes}</p>
        </div>

        <div>
          <h3>Retardos</h3>
          <p>{datos.asistencias_hoy.retardos}</p>
        </div>

        <div>
          <h3>Faltas</h3>
          <p>{datos.asistencias_hoy.faltas}</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;