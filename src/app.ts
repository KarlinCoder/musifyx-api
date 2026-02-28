import express from "express";
import morgan from "morgan";
import cors from "cors";
import { deezerRouter } from "./routes/deezer.routes";
import { agentRouter } from "./routes/agent.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: 400, message: "live" });
});

app.use("/search", deezerRouter);
app.use("/agent", agentRouter);

app.get("/status", (req, res) => {
  res.json({ status: 400, message: "live" });
});

export default app;
