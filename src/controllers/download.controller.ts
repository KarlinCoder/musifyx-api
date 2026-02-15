import { Request, Response } from "express";
import Spotify from "spotifydl-core";

const spotify = new Spotify({
  clientId: process.env.SPOTIFY_CLIENT_ID ?? "86b67fe673cb4132b21e190524a3368f",
  clientSecret:
    process.env.SPOTIFY_CLIENT_SECRET ?? "5f9f8018f46c44d3bbaa81ba9197091c",
});

export class DownloadController {
  static async downloadSong(req: Request, res: Response) {
    try {
      const trackUrl = `https://open.spotify.com/track/${req.params.id}`;

      // Obtener metadatos para el nombre del archivo
      const track = await spotify.getTrack(trackUrl);
      const filename = `${track.artists.map((a) => a.name).join(", ")} - ${
        track.name
      }.mp3`.replace(/[/\\?%*:|"<>]/g, "_");

      // Descargar como buffer
      const audioBuffer = await spotify.downloadTrack(trackUrl);

      // Enviar como descarga
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "No se pudo descargar la canción" });
    }
  }

  static async downloadAlbum(req: Request, res: Response) {
    try {
      const albumUrl = `https://open.spotify.com/album/${req.params.id}`;
      const album = await spotify.getAlbum(albumUrl);

      // Por simplicidad, devolvemos solo la primera pista del álbum
      // (spotifydl-core no tiene descarga nativa de álbum completo como zip)
      if (!album.tracks.items.length) {
        return res.status(404).json({ error: "Álbum sin pistas" });
      }

      const firstTrackUrl = album.tracks.items[0].external_urls.spotify;
      const track = await spotify.getTrack(firstTrackUrl);
      const filename = `${track.artists.map((a) => a.name).join(", ")} - ${
        track.name
      }.mp3`.replace(/[/\\?%*:|"<>]/g, "_");

      const audioBuffer = await spotify.downloadTrack(firstTrackUrl);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "No se pudo descargar del álbum" });
    }
  }

  static async downloadPlaylist(req: Request, res: Response) {
    // spotifydl-core no soporta descarga directa de playlist como archivo único
    // Así que devolvemos un error amigable
    res.status(400).json({
      error: "La descarga de playlists no está soportada en esta versión",
    });
  }
}
