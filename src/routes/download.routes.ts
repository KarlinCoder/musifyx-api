import { Router } from "express";
import {
  downloadAlbum,
  downloadPlaylist,
  downloadTack,
} from "../controllers/download.controller";

export const downloadRoutes = Router();

downloadRoutes.get("/album/:id", downloadAlbum);
downloadRoutes.get("/playlist/:id", downloadPlaylist);
downloadRoutes.get("/track/:id", downloadTack);
