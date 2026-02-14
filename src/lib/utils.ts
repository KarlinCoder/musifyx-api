import os from "node:os";
import path from "node:path";

export function getCliPath() {
  const cliPath =
    os.platform() === "linux"
      ? path.resolve("bin", "deemix-cli-linux")
      : path.resolve("bin", "deemix-cli-win.exe");

  console.log(cliPath);
}
