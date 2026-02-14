// src/controllers/download.controller.ts
import { Request, Response } from "express";
import { createHash, createDecipheriv, createCipheriv } from "crypto";
import { pipeline } from "stream/promises";
import got from "got";
import { CookieJar } from "tough-cookie";
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream, unlink } from "fs";
import { promisify } from "util";

const ARL_TOKEN = process.env.DEEZER_ARL;
if (!ARL_TOKEN) {
  console.warn("⚠️ DEEZER_ARL no configurado");
}

const unlinkAsync = promisify(unlink);

// --- Funciones criptográficas (igual que antes) ---
function _md5(data: string | Buffer, type: BufferEncoding = "binary"): string {
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

// --- Subir a tmpfiles.org ---
async function uploadToTmpFiles(filePath: string): Promise<string> {
  const formData = new FormData();
  const fileBlob = await fs.promises.readFile(filePath);
  // @ts-ignore — Node.js no tiene Blob nativo, así que usamos got con stream
  const response = await got
    .post("https://tmpfiles.org/api/v1/upload", {
      body: new URLSearchParams(),
      files: [
        {
          field: "file",
          path: filePath,
        },
      ],
    })
    .json<any>();

  // La API devuelve algo como: { status: true, link: "https://tmpfiles.org/dl/abc123/file.mp3" }
  // Pero en realidad, **no devuelve JSON**, devuelve HTML con redirección.
  // Así que mejor parseamos la respuesta real:
  const uploadResponse = await got.post("https://tmpfiles.org/api/v1/upload", {
    headers: { "User-Agent": "Mozilla/5.0" },
    body: undefined,
    responseType: "text",
  });

  // En realidad, tmpfiles.org **no tiene una API JSON pública**.
  // El ejemplo con curl devuelve una **redirección HTML**.
  // Por lo tanto, usamos este workaround:
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename: "track.mp3",
    contentType: "audio/mpeg",
  });

  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  // La respuesta es: https://tmpfiles.org/dl/xxxxx/filename.ext
  if (text.startsWith("https://tmpfiles.org/")) {
    return text.trim();
  }

  throw new Error("No se pudo obtener la URL de tmpfiles.org");
}

// --- Controlador principal ---
export class DownloadController {
  static async downloadSong(req: Request, res: Response) {
    const trackId = req.params.id;

    if (!/^\d+$/.test(trackId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (!ARL_TOKEN) {
      return res.status(500).json({ error: "Falta DEEZER_ARL" });
    }

    // Ruta temporal
    const tempPath = join(tmpdir(), `track_${trackId}_${Date.now()}.mp3`);

    try {
      // === 1. Obtener datos de la pista ===
      const cookieJar = new CookieJar();
      cookieJar.setCookieSync(`arl=${ARL_TOKEN}`, "https://www.deezer.com");

      const gwResponse = await got
        .post(
          "https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=",
          { json: true, cookieJar }
        )
        .json<any>();
      const apiToken = gwResponse.checkForm;

      const trackResponse = await got
        .post(
          `https://www.deezer.com/ajax/gw-light.php?method=deezer.pageTrack&input=3&api_version=1.0&api_token=${apiToken}`,
          { json: { SNG_ID: trackId }, cookieJar }
        )
        .json<any>();

      const trackData = trackResponse.DATA;
      if (!trackData?.MD5_ORIGIN) {
        return res.status(404).json({ error: "Canción no disponible" });
      }

      const { SNG_ID, MD5_ORIGIN, MEDIA_VERSION } = trackData;
      const FORMAT = "MP3_320";

      // === 2. Generar URL y clave ===
      const url = generateCryptedStreamURL(
        SNG_ID,
        MD5_ORIGIN,
        MEDIA_VERSION,
        FORMAT
      );
      const blowfishKey = generateBlowfishKey(SNG_ID);

      // === 3. Descargar y guardar en disco temporal ===
      const request = got.stream(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        https: { rejectUnauthorized: false },
      });

      let buffer = Buffer.alloc(0);
      let isFirstChunk = true;

      const transform = new TransformStream({
        async transform(chunk: Uint8Array, controller) {
          buffer = Buffer.concat([buffer, chunk]);
          while (buffer.length >= 2048 * 3) {
            const processing = buffer.slice(0, 2048 * 3);
            buffer = buffer.slice(2048 * 3);
            let output = processing;
            if (processing.length >= 2048) {
              const decrypted = await decryptChunk(
                processing.slice(0, 2048),
                blowfishKey
              );
              output = Buffer.concat([decrypted, processing.slice(2048)]);
            }
            controller.enqueue(output);
          }
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
          if (buffer.length > 0) controller.enqueue(buffer);
        },
      });

      const fileStream = createWriteStream(tempPath);
      // @ts-ignore
      await request.pipeThrough(transform).pipeTo(
        new WritableStream({
          write(chunk) {
            fileStream.write(chunk);
          },
          close() {
            fileStream.end();
          },
        })
      );

      await new Promise((resolve) => fileStream.on("close", resolve));

      // === 4. Subir a tmpfiles.org ===
      const form = new FormData();
      form.append("file", fs.createReadStream(tempPath), {
        filename: `track_${SNG_ID}.mp3`,
        contentType: "audio/mpeg",
      });

      const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: form,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const uploadText = await uploadRes.text();

      if (!uploadText.startsWith("https://tmpfiles.org/")) {
        throw new Error("Respuesta inesperada de tmpfiles.org");
      }

      const downloadUrl = uploadText.trim();

      // === 5. Responder con la URL ===
      res.json({ url: downloadUrl });
    } catch (error: any) {
      console.error("Error:", error.message);
      res
        .status(500)
        .json({
          error: "Error al procesar la descarga",
          details: error.message,
        });
    } finally {
      // Limpiar archivo temporal
      try {
        await unlinkAsync(tempPath);
      } catch (e) {
        console.warn("No se pudo eliminar el archivo temporal:", tempPath);
      }
    }
  }
}
