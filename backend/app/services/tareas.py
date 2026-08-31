import asyncio

from app.database import SessionLocal
from app.services.asistencias import generar_faltas_automaticas


async def revisar_faltas_automaticas():

    while True:

        db = SessionLocal()

        try:
            faltas = generar_faltas_automaticas(db)

            if faltas > 0:
                print(
                    f"Se generaron {faltas} falta(s) automáticamente"
                )

        except Exception as e:
            print(
                f"Error al generar faltas automáticas: {e}"
            )

        finally:
            db.close()

        # Revisar cada minuto
        await asyncio.sleep(60)