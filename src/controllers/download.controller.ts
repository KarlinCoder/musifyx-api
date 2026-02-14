// src/controllers/DownloadController.ts
import { Request, Response } from "express";
import { createHash, createDecipheriv, createCipheriv } from "crypto";
import { pipeline } from "stream/promises";
import got from "got";
import { CookieJar } from "tough-cookie";

// Configuración (puedes mover esto a un archivo .env)
const ARL_TOKEN = process.env.DEEZER_ARL; // ¡Asegúrate de definirlo!
const DEFAULT_BITRATE = "MP3_320"; // Opciones: FLAC, MP3_320, MP3_128, etc.

// --- Funciones criptográficas ---
function _md5(data: string, type: BufferEncoding = "binary"): string {
  return createHash("md5").update(Buffer.from(data, type)).digest("hex");
}

function _ecbCrypt(key: string, data: string): string {
  const cipher = createCipheriv(
    "aes-128-ecb",
    Buffer.from(key),
    Buffer.alloc(0)
  );
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data, "binary"), cipher.final()])
    .toString("hex")
    .toLowerCase();
}

function generateStreamPath(
  sngID: string,
  md5: string,
  mediaVersion: string,
  format: string
): string {
  let urlPart = md5 + "\xA4" + format + "\xA4" + sngID + "\xA4" + mediaVersion;
  const md5val = _md5(urlPart);
  let step2 = md5val + "\xA4" + urlPart + "\xA4";
  step2 += ".".repeat(16 - (step2.length % 16));
  return _ecbCrypt("jo6aey6haid2Teih", step2);
}

function generateCryptedStreamURL(
  sngID: string,
  md5: string,
  mediaVersion: string,
  format: string
): string {
  const urlPart = generateStreamPath(sngID, md5, mediaVersion, format);
  return `https://e-cdns-proxy-${md5[0]}.dzcdn.net/mobile/1/${urlPart}`;
}

function generateBlowfishKey(trackId: string): string {
  const SECRET = "g4el58wc0zvf9na1";
  const idMd5 = _md5(trackId, "ascii");
  let bfKey = "";
  for (let i = 0; i < 16; i++) {
    bfKey += String.fromCharCode(
      idMd5.charCodeAt(i) ^ idMd5.charCodeAt(i + 16) ^ SECRET.charCodeAt(i)
    );
  }
  return bfKey;
}

async function decryptChunk(
  chunk: Buffer,
  blowfishKey: string
): Promise<Buffer> {
  const decipher = createDecipheriv(
    "bf-cbc",
    blowfishKey,
    Buffer.from([0, 1, 2, 3, 4, 5, 6, 7])
  );
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(chunk), decipher.final()]);
}

// --- Controlador ---
export class DownloadController {
  static async downloadSong(req: Request, res: Response) {
    const trackId = req.params.id;

    if (!trackId || isNaN(Number(trackId))) {
      return res.status(400).json({ error: "ID de canción inválido" });
    }

    if (!ARL_TOKEN) {
      return res
        .status(500)
        .json({ error: "Falta el token ARL en las variables de entorno" });
    }

    try {
      // === Paso 1: Obtener datos de la canción desde la API de Deezer ===
      const cookieJar = new CookieJar();
      cookieJar.setCookieSync(`arl=${ARL_TOKEN}`, "https://www.deezer.com");

      // Obtener api_token
      const gwUserResponse = await got
        .post(
          "https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=",
          { json: true, cookieJar }
        )
        .json<any>();

      const apiToken = gwUserResponse.checkForm;

      // Obtener datos detallados de la pista
      const trackResponse = await got
        .post(
          `https://www.deezer.com/ajax/gw-light.php?method=deezer.pageTrack&input=3&api_version=1.0&api_token=${apiToken}`,
          { json: { SNG_ID: trackId }, cookieJar }
        )
        .json<any>();

      const trackData = trackResponse.DATA;

      if (!trackData?.MD5_ORIGIN) {
        return res
          .status(404)
          .json({ error: "Canción no encontrada o no disponible" });
      }

      const { SNG_ID, MD5_ORIGIN, MEDIA_VERSION } = trackData;

      // === Paso 2: Generar URL de descarga ===
      const isEncrypted = true; // Siempre usamos /mobile/ para streams premium
      const url = generateCryptedStreamURL(
        SNG_ID,
        MD5_ORIGIN,
        MEDIA_VERSION,
        DEFAULT_BITRATE
      );
      const blowfishKey = generateBlowfishKey(SNG_ID);

      // === Paso 3: Configurar respuesta ===
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="track_${SNG_ID}.mp3"`
      );

      // === Paso 4: Stream de descarga + desencriptación ===
      const request = got.stream(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        https: { rejectUnauthorized: false },
      });

      let buffer = Buffer.alloc(0);
      let isFirstChunk = true;

      const transform = new TransformStream({
        async transform(chunk: Uint8Array, controller) {
          if (!isEncrypted) {
            controller.enqueue(chunk);
            return;
          }

          buffer = Buffer.concat([buffer, chunk]);
          while (buffer.length >= 2048 * 3) {
            const decrypting = buffer.slice(0, 2048 * 3);
            buffer = buffer.slice(2048 * 3);

            let output = Buffer.alloc(0);
            if (decrypting.length >= 2048) {
              const decrypted = await decryptChunk(
                decrypting.slice(0, 2048),
                blowfishKey
              );
              output = Buffer.concat([decrypted, decrypting.slice(2048)]);
            }
            controller.enqueue(output);
          }

          // Eliminar padding inicial si es necesario (solo en primer chunk)
          if (isFirstChunk && buffer.length > 0) {
            if (buffer[0] === 0 && buffer.slice(4, 8).toString() !== "ftyp") {
              let i = 0;
              while (i < buffer.length && buffer[i] === 0) i++;
              if (i > 0) buffer = buffer.slice(i);
            }
            isFirstChunk = false;
          }
        },

        flush(controller) {
          if (buffer.length > 0) {
            controller.enqueue(buffer);
          }
        },
      });

      // Pipe al cliente
      const readable = request;
      const writable = new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      });

      // @ts-ignore — pipeline con TransformStream
      await readable.pipeThrough(transform).pipeTo(writable);
    } catch (error: any) {
      console.error("Error al descargar:", error.message);
      if (res.headersSent) {
        res.socket?.destroy();
      } else {
        res.status(500).json({
          error: "Error interno al procesar la descarga",
          details: error.message,
        });
      }
    }
  }
}
