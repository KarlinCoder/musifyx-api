import { Router } from "express";
import {
  getAlbum,
  getArtist,
  getArtistAlbums,
  getArtistTop10,
  getPlaylist,
  getPopular,
  searchAlbums,
  searchArtists,
  searchPlaylists,
  searchTracks,
} from "../controllers/deezer.controller";

export const deezerRouter = Router();

deezerRouter.get("/", (_req, res) => {
  return res.send("Empieza a buscar");
});

deezerRouter.get("/track", searchTracks);
deezerRouter.get("/album", searchAlbums);
deezerRouter.get("/artist", searchArtists);
deezerRouter.get("/playlist", searchPlaylists);

deezerRouter.get("/album/:id", getAlbum);
deezerRouter.get("/artist/:id", getArtist);
deezerRouter.get("/artist/:id/albums", getArtistAlbums);
deezerRouter.get("/artist/:id/top", getArtistTop10);
deezerRouter.get("/playlist/:id", getPlaylist);
deezerRouter.get("/popular", getPopular);
