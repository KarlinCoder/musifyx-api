import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";

export const getAlbumZip = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  const albumZipDir = path.join(
    process.cwd(),
    "downloads",
    "albums",
    albumId.toString(),
  );

  try {
    const files = fs.readdirSync(albumZipDir);

    const zipFile = files.find((f) => f.endsWith(".zip"));

    if (!zipFile) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún archivo ZIP en este álbum" });
    }

    const filePath = path.join(albumZipDir, zipFile);

    res.sendFile(filePath, {
      headers: {
        "Content-Disposition": `attachment; filename="${zipFile}"`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar el archivo" });
  }
};
