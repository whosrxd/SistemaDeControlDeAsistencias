import Login from "./pages/Login/Login";
import Admin from "./pages/Admin";
import Maestro from "./pages/Maestro";

function App() {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    // No hay sesión
    if (!token) {
        return <Login />;
    }

    // Administrador
    if (rol === "admin") {
        return <Admin />;
    }

    // Maestro
    if (rol === "maestro") {
        return <Maestro />;
    }

    // Rol desconocido
    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    return <Login />;
}

export default App;