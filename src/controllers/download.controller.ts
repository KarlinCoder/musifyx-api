import { exec, execSync } from "child_process";
import { Request, Response } from "express";

export const downloadAlbum = (req: Request, res: Response) => {
  console.log("aca");
  exec("python --version", (err, stdout) => {
    res.json({ message: "Album descargado exitosamente", data: stdout.trim() });
  });
};

export const downloadTack = async (req: Request, res: Response) => {
  res.json({ message: "Download track" });
};

export const downloadPlaylist = async (req: Request, res: Response) => {
  res.json({ message: "Download playlist" });
};
