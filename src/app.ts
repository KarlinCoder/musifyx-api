import express from "express";
import morgan from "morgan";
import cors from "cors";
import { deezerRouter } from "./routes/deezer.routes";
import { agentRouter } from "./routes/agent.routes";
import { downloadRoutes } from "./routes/download.routes";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { downloadsRoutes } from "./routes/downloads.routes";

const execPromise = promisify(exec);

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
app.use("/downloads", downloadsRoutes);

app.get("/status", async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise("python3 --version");

    res.json({
      status: 200,
      message: "live",
      python_version: stdout.trim() || stderr.trim(),
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error checking python",
      error: error.message,
    });
  }
});

export default app;
