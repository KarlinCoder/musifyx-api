import { exec } from "child_process";
import { Request, Response } from "express";
import { promisify } from "util";
import path from "node:path";

const execPromise = promisify(exec);
const scriptPath = path.join(process.cwd(), "python", "download.py");

export const downloadAlbum = async (req: Request, res: Response) => {
  const albumId = Number(req.params.id);
  const downloadedAlbumZipPath = await execPromise(
    `python3 ${scriptPath} album ${albumId} --lyrics none`,
  );
  res.json({ downloadedAlbumZipPath });
};

export const downloadTack = async (req: Request, res: Response) => {
  res.json({ message: "Download track" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist" });
};
