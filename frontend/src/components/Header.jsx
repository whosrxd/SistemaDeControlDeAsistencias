function Header() {
    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");

        window.location.reload();
    };

    return (
        <header>
        <h1>Panel de Administrador</h1>

        <button onClick={cerrarSesion}>
            Cerrar sesión
        </button>
        </header>
    );
}

export default Header;