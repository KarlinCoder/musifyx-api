import { Router } from "express";
import { getRecomendation } from "../controllers/agent.controller";

export const agentRouter = Router();

agentRouter.post("/", getRecomendation);
