import { Router } from "express";
import {
  searchAlbums,
  searchArtists,
  searchPlaylists,
  searchTracks,
} from "../controllers/deezer.controller";

export const deezerRouter = Router();

deezerRouter.get("/", (_req, res) => {
  return res.send("Empieza a buscar");
});
deezerRouter.get("/tracks", searchTracks);
deezerRouter.get("/albums", searchAlbums);
deezerRouter.get("/artists", searchArtists);
deezerRouter.get("/playlists", searchPlaylists);
