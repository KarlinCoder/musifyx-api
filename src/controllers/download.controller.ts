import { Response } from "express";
import { Request } from "express";

export class DownloadController {
  static async downloadSong(req: Request, res: Response) {
    res.json({ message: `Descargando cancion ${req.params.id}` });
  }

  static async downloadAlbum(req: Request, res: Response) {
    res.json({ message: `Descargando album ${req.params.id}` });
  }

  static async downloadPlaylist(req: Request, res: Response) {
    res.json({ message: `Descargando playlist ${req.params.id}` });
  }
}
