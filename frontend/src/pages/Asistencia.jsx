import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { registrarAsistencia } from "../services/api";

function Asistencia() {
    const scannerRef = useRef(null);
    const procesandoRef = useRef(false);

    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState("");
    const [escaneando, setEscaneando] = useState(true);

    useEffect(() => {
        const scanner = new Html5Qrcode("lector-qr");
        scannerRef.current = scanner;

        iniciarScanner(scanner);

        return () => {
            if (scanner.isScanning) {
                scanner.stop().catch(() => {});
            }
        };
    }, []);

    const iniciarScanner = async (scanner) => {
        try {
            setEscaneando(true);
            setError("");

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    }
                },
                async (qrToken) => {
                    await procesarQR(qrToken);
                },
                () => {}
            );

        } catch (error) {
            setError("No se pudo acceder a la cámara");
            setEscaneando(false);
        }
    };

    const detenerScanner = async () => {
        const scanner = scannerRef.current;

        if (scanner && scanner.isScanning) {
            try {
                await scanner.stop();
            } catch (error) {
                console.log("Error al detener scanner:", error);
            }
        }
    };

    const procesarQR = async (qrToken) => {
        if (procesandoRef.current) return;

        procesandoRef.current = true;

        await detenerScanner();

        setEscaneando(false);
        setError("");
        setResultado(null);

        try {
            const data = await registrarAsistencia(qrToken);

            setResultado(data);

        } catch (error) {
            setError(error.message);
        }
    };

    const reiniciarScanner = async () => {
        const scanner = scannerRef.current;

        procesandoRef.current = false;
        setResultado(null);
        setError("");
        setEscaneando(true);

        // Esperar a que vuelva a existir el div
        setTimeout(async () => {
            if (!scanner) return;

            try {
                await iniciarScanner(scanner);
            } catch (error) {
                setError("No se pudo reiniciar la cámara");
            }
        }, 100);
    };

    return (
        <div>
            <h1>Registrar asistencia</h1>

            {escaneando && (
                <div>
                    <h2>Escanea el QR del aula</h2>

                    <div
                        id="lector-qr"
                        style={{
                            width: "300px"
                        }}
                    />
                </div>
            )}

            {error && (
                <div>
                    <p>❌ {error}</p>

                    <button onClick={reiniciarScanner}>
                        Intentar nuevamente
                    </button>
                </div>
            )}

            {resultado && (
                <div>
                    <h2>✅ Asistencia registrada</h2>

                    <p>
                        <strong>Materia:</strong>{" "}
                        {resultado.asistencia.materia}
                    </p>

                    <p>
                        <strong>Aula:</strong>{" "}
                        {resultado.asistencia.aula}
                    </p>

                    <p>
                        <strong>Estado:</strong>{" "}
                        {resultado.asistencia.estado}
                    </p>

                    <p>
                        <strong>Hora:</strong>{" "}
                        {resultado.asistencia.hora_registro}
                    </p>

                    <button onClick={reiniciarScanner}>
                        Escanear nuevamente
                    </button>
                </div>
            )}
        </div>
    );
}

export default Asistencia;