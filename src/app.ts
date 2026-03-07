import express from "express";
import morgan from "morgan";
import cors from "cors";
import { deezerRouter } from "./routes/deezer.routes";
import { agentRouter } from "./routes/agent.routes";
import { downloadRoutes } from "./routes/download.routes";
import { exec } from "node:child_process";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: 400, message: "live" });
});

app.use("/search", deezerRouter);
app.use("/agent", agentRouter);
app.use("/download", downloadRoutes);

app.get("/status", (req, res) => {
  let pythonVersion = "";
  exec("python --version", (error, stdout, stderr) => {
    if (error) {
      pythonVersion = error.message;
      return;
    }

    pythonVersion = stdout;
  });

  res.json({ status: 400, message: "live", python_version: pythonVersion });
});

export default app;
