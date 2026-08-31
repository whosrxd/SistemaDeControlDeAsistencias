import Login from "./pages/Login/Login";
import Admin from "./pages/Admin";
import Maestro from "./pages/Maestro";
import Responsable from "./pages/Responsable";

function App() {

    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token) {
        return <Login />;
    }

    if (rol === "admin") {
        return <Admin />;
    }

    if (rol === "maestro") {
        return <Maestro />;
    }

    if (rol === "responsable") {
        return <Responsable />;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    return <Login />;
}

export default App;