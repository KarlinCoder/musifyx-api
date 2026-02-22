import express from "express";
import morgan from "morgan";
import cors from "cors";
import { deezerRouter } from "./routes/deezer.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: 400, message: "live" });
});

app.use("/search", deezerRouter);

app.get("/status", (req, res) => {
  res.json({ status: 400, message: "live" });
});

export default app;
