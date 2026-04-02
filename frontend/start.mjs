import { spawn } from "node:child_process";
import net from "node:net";

function launch(name, command, cwd) {
  const child = spawn(command, {
    cwd,
    stdio: "inherit",
    shell: true
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}.`);
    }
  });

  return child;
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      resolve(false);
    });
  });
}

const backendAlreadyRunning = await isPortOpen(4000);

if (backendAlreadyRunning) {
  console.log("Port 4000 is already in use, so Summit Prep will reuse the existing backend.");
}

const backend = backendAlreadyRunning
  ? null
  : launch("backend", "npm run start:api --prefix ..", process.cwd());
const frontend = launch("frontend", "npm run dev", process.cwd());

function shutdown() {
  backend?.kill("SIGINT");
  frontend.kill("SIGINT");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
