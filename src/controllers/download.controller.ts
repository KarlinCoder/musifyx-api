import { exec } from "child_process";
import { Request, Response } from "express";
import { promisify } from "util";
import path from "node:path";

const execPromise = promisify(exec);
const scriptPath = path.resolve(process.cwd(), "python", "download.py");
console.log(scriptPath);

export const downloadAlbum = async (req: Request, res: Response) => {
  const albumId = Number(req.params.id);
  const { stdout } = await execPromise(
    `python3 ${scriptPath} album ${albumId}`,
  );
  res.json({ album_url: stdout });
};

export const downloadTack = async (req: Request, res: Response) => {
  res.json({ message: "Download track" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist" });
};
