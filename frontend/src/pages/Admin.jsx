import { useState } from "react";

import Dashboard from "./Dashboard";
import Maestros from "./Maestros";
import Materias from "./Materias";
import Aulas from "./Aulas";


function Admin() {
    const [pagina, setPagina] = useState("dashboard");


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

            default:
                return <Dashboard />;
        }
    };


    return (
        <div>

            {/* SIDEBAR */}

            <aside>

                <h2>
                    Administración
                </h2>


                <button
                    onClick={() => setPagina("dashboard")}
                >
                    Dashboard
                </button>


                <button
                    onClick={() => setPagina("maestros")}
                >
                    Maestros
                </button>


                <button
                    onClick={() => setPagina("materias")}
                >
                    Materias
                </button>

                <button onClick={() => setPagina("aulas")}>
                    Aulas
                </button>

                <button
                    onClick={cerrarSesion}
                >
                    Cerrar sesión
                </button>

            </aside>


            {/* CONTENIDO */}

            <main>

                {mostrarPagina()}

            </main>

        </div>
    );
}


export default Admin;