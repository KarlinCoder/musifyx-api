import { Request, Response } from "express";
import { promisify } from "util";
import path from "node:path";
import { spawn } from "node:child_process";

const scriptPath = path.resolve(process.cwd(), "python", "download.py");
console.log(scriptPath);

export const downloadAlbum = async (req: Request, res: Response) => {
  const albumId = Number(req.params.id);
  const command = `python3 ${scriptPath} album ${albumId}`;

  let response = "";

  const process = spawn(command);

  process.stdout.on("data", (data: string) => {
    response += data;
  });

  process.on("error", () => {
    res.json({ album_url: response });
  });
};

export const downloadTack = async (req: Request, res: Response) => {
  res.json({ message: "Download track" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist" });
};
