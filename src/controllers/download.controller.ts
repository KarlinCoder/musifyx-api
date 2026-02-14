import { Request, Response } from "express";

export class DownloadController {
  static async downloadSong(req: Request, res: Response) {
    res.json({ message: "descargando" });
  }
}
