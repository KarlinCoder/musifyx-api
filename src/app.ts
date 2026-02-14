import express from "express";
import morgan from "morgan";
import { downloadRouter } from "./routes/download.route";

const app = express();

app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.json({ status: 400, message: "live" });
});
app.use("/download", downloadRouter);
app.get("/status", (req, res) => {
  res.json({ status: 400, message: "live" });
});

export default app;
