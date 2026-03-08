import { Request, Response } from "express";
import path from "node:path";
import { spawn } from "node:child_process";

const PYTHON_SCRIPT = "download.py";
const PYTHON_DIR = path.resolve(process.cwd(), "python");

// ✅ Marcadores para extraer el JSON limpio
const JSON_START = "###MUSIFY_JSON_START###";
const JSON_END = "###MUSIFY_JSON_END###";

export const downloadAlbum = async (req: Request, res: Response) => {
  const albumId = req.params.id;

  // ✅ Variables para acumular datos
  let stdoutData = "";
  let stderrData = "";
  let jsonResult: any = null;
  let processError: Error | null = null;
  let isResponseSent = false;

  console.log(`[🚀 Spawn] Iniciando descarga del álbum ${albumId}...`);

  // ✅ CORRECCIÓN 1: spawn recibe comando y argumentos separados
  const pythonProcess = spawn("python3", [PYTHON_SCRIPT, "album", albumId], {
    cwd: PYTHON_DIR, // ✅ CORRECCIÓN 2: Directorio de trabajo correcto
    env: { ...process.env, PYTHONUNBUFFERED: "1" }, // ✅ CORRECCIÓN 3: Output inmediato
  });

  // ✅ Manejo de STDOUT (Solo para el JSON final)
  pythonProcess.stdout.on("data", (data: Buffer) => {
    const chunk = data.toString();
    stdoutData += chunk;

    // Intentar extraer el JSON si ya aparecieron los marcadores
    if (stdoutData.includes(JSON_START) && stdoutData.includes(JSON_END)) {
      const startIdx = stdoutData.indexOf(JSON_START);
      const endIdx = stdoutData.indexOf(JSON_END);
      const jsonStr = stdoutData
        .substring(startIdx + JSON_START.length, endIdx)
        .trim();

      try {
        jsonResult = JSON.parse(jsonStr);
        console.log("[✅ JSON] Resultado recibido correctamente.");
      } catch (e) {
        console.error("[❌ Parse Error] No se pudo parsear el JSON:", jsonStr);
      }
    }
  });

  // ✅ Manejo de STDERR (Logs, barras de progreso, warnings)
  pythonProcess.stderr.on("data", (data: Buffer) => {
    const chunk = data.toString();
    stderrData += chunk;
    // Imprimir en tiempo real para ver el progreso en los logs del servidor
    process.stdout.write(`[🐍 PyProgress] ${chunk}`);
  });

  // ✅ CORRECCIÓN 4: Esperar al evento 'close' para saber si terminó
  pythonProcess.on("close", (code) => {
    if (isResponseSent) return; // Evitar enviar respuesta doble

    if (code !== 0 && !jsonResult?.success) {
      processError = new Error(
        `Proceso terminado con código ${code}. ${stderrData}`,
      );
    }

    if (processError) {
      console.error("[❌ Error Fatal]", processError.message);
      isResponseSent = true;
      return res.status(500).json({
        success: false,
        error: processError.message,
        logs: stderrData.slice(-500), // Últimos 500 chars para debug
      });
    }

    if (!jsonResult) {
      isResponseSent = true;
      return res.status(500).json({
        success: false,
        error: "El script finalizó pero no devolvió un JSON válido.",
      });
    }

    if (!jsonResult.success) {
      isResponseSent = true;
      return res.status(500).json({
        success: false,
        error: jsonResult.error || "Error reportado por Python",
        details: jsonResult.type,
      });
    }

    // ✅ Éxito
    isResponseSent = true;
    return res.json({
      success: true,
      data: {
        download_url: jsonResult.download_url,
        filename: jsonResult.filename,
        size_mb: jsonResult.size_mb,
      },
    });
  });

  // ✅ CORRECCIÓN 5: Manejo de errores del spawn (ej: python no encontrado)
  pythonProcess.on("error", (err) => {
    if (isResponseSent) return;

    console.error("[💥 Spawn Error]", err.message);
    isResponseSent = true;
    return res.status(500).json({
      success: false,
      error: `No se pudo ejecutar Python: ${err.message}`,
    });
  });

  // ✅ BONUS: Cancelar proceso si el cliente desconecta
  req.socket.on("close", () => {
    if (!pythonProcess.killed) {
      console.log(`[⚠️ Cliente desconectado] Matando proceso ${albumId}...`);
      pythonProcess.kill("SIGTERM");
    }
  });
};

export const downloadTrack = async (req: Request, res: Response) => {
  res.json({ message: "Download track - próximamente" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist - próximamente" });
};
