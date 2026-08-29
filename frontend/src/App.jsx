import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setMensaje(data.mensaje))
      .catch(() => setMensaje("No se pudo conectar con el backend"));
  }, []);

  return (
    <div>
      <h1>Sistema de Control de Asistencias</h1>
      <p>{mensaje}</p>
    </div>
  );
}

export default App;