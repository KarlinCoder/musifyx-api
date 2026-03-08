import { Request, Response } from "express";
import { promisify } from "util";
import path from "node:path";
import { spawn } from "node:child_process";

const scriptPath = path.resolve(process.cwd(), "python", "download.py");
console.log(scriptPath);

export const downloadAlbum = async (req: Request, res: Response) => {
  const albumId = req.params.id.toString();
  // const command = `python3 ${scriptPath} album ${albumId}`;

  let response = "";

  const process = spawn("python3", [scriptPath, "album", albumId]);

  process.stdout.on("data", (data: string) => {
    response += data.toString();
  });

  process.on("exit", () => {
    const parsedResponse = response.split("\n")[0];
    res.json({ album_url: parsedResponse });
  });
};

export const downloadTack = async (req: Request, res: Response) => {
  res.json({ message: "Download track" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist" });
};
