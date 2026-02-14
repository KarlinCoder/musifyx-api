import { Router } from "express";
import { DownloadController } from "../controllers/download.controller";

export const downloadRouter = Router();

downloadRouter.get("/song/:id", DownloadController.downloadSong);
