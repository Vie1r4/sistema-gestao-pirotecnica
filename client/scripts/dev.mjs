/**
 * Arranca Next em 0.0.0.0 (acessível na LAN) e mostra URLs com IP real.
 * O Next imprime "Network: http://0.0.0.0:3000" — isso não abre no telemóvel;
 * use um dos http://<IP>:3000 listados abaixo.
 */
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const PORT = 3000;

function isIPv4(family) {
  return family === "IPv4" || family === 4;
}

function printLanUrls() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name] ?? []) {
      if (isIPv4(iface.family) && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  const uniq = [...new Set(ips)];
  console.log("");
  console.log(
    "  Telemóvel / outro PC: use http://<IP>:" +
      PORT +
      " — não use 0.0.0.0 na barra do browser."
  );
  if (uniq.length > 0) {
    console.log("  Aceda por exemplo a:");
    for (const ip of uniq) {
      console.log(`    http://${ip}:${PORT}`);
    }
  } else {
    console.log("  (nenhum IPv4 não-interno detetado — confirme Wi‑Fi.)");
  }
  console.log("");
}

printLanUrls();

const child = spawn(process.execPath, [nextBin, "dev", "-H", "0.0.0.0", "-p", String(PORT)], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
