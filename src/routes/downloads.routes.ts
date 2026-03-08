import { Router } from "express";
import { getAlbumZip } from "../controllers/downloads.controller";

export const downloadsRoutes = Router();

downloadsRoutes.get("/albums/:albumId", getAlbumZip);
