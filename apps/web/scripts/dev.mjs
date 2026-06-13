/**
 * Arranca Next em 0.0.0.0 (LAN) com banner de URLs legível.
 * O Next imprime "Network: http://0.0.0.0:3000" — substituímos por IPs reais.
 */
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const WEB_PORT = 3000;
const API_HTTPS_PORT = 7225;
const API_HTTP_PORT = 5078;

const VIRTUAL_IFACE_HINTS =
  /hyper-v|vethernet|wsl|docker|vmware|virtualbox|vbox|loopback|npcap|tap|tun/i;

function isIPv4(family) {
  return family === "IPv4" || family === 4;
}

function isPrivateLanIp(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

function isLikelyVirtual(name, ip) {
  if (VIRTUAL_IFACE_HINTS.test(name)) return true;
  const parts = ip.split(".").map(Number);
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function collectNetworkTargets() {
  const nets = os.networkInterfaces();
  const lan = [];
  const virtual = [];

  for (const [name, ifaces] of Object.entries(nets)) {
    for (const iface of ifaces ?? []) {
      if (!isIPv4(iface.family) || iface.internal) continue;
      const entry = { name, ip: iface.address };
      if (isLikelyVirtual(name, iface.address)) virtual.push(entry);
      else if (isPrivateLanIp(iface.address)) lan.push(entry);
      else virtual.push(entry);
    }
  }

  const dedupe = (list) => {
    const seen = new Set();
    return list.filter((e) => {
      const key = e.ip;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return { lan: dedupe(lan), virtual: dedupe(virtual) };
}

function padEnd(str, width) {
  return str.length >= width ? str : str + " ".repeat(width - str.length);
}

/** Turbopack é o default (Next 16, muito mais rápido em dev). Forçar Webpack com NEXT_DEV_BUNDLER=webpack. */
function shouldUseTurbo() {
  return process.env.NEXT_DEV_BUNDLER !== "webpack";
}

function printDevBanner() {
  const { lan, virtual } = collectNetworkTargets();
  const useTurbo = shouldUseTurbo();
  const bundlerLabel = useTurbo ? "Turbopack" : "Webpack";

  const lines = [];
  const rule = "─".repeat(56);

  lines.push("");
  lines.push(`  PIROFAFE · frontend dev (${bundlerLabel})`);
  lines.push(`  ${rule}`);

  lines.push("  Este PC");
  lines.push(`    Site   http://localhost:${WEB_PORT}`);
  lines.push(`    API    https://localhost:${API_HTTPS_PORT}`);

  if (lan.length > 0) {
    lines.push("");
    lines.push("  Rede local (telemóvel / outro PC na mesma Wi‑Fi)");
    for (const { name, ip } of lan) {
      const label = padEnd(name, 14);
      lines.push(`    ${label}  http://${ip}:${WEB_PORT}`);
      lines.push(`    ${" ".repeat(14)}  API → http://${ip}:${API_HTTP_PORT}`);
    }
  }

  if (virtual.length > 0) {
    lines.push("");
    lines.push("  Adaptadores virtuais (só se o telemóvel não ligar acima)");
    for (const { name, ip } of virtual) {
      const label = padEnd(name, 14);
      lines.push(`    ${label}  http://${ip}:${WEB_PORT}`);
    }
  }

  if (lan.length === 0 && virtual.length === 0) {
    lines.push("");
    lines.push("  Rede local: nenhum IPv4 detetado — confirme Wi‑Fi/Ethernet.");
  }

  lines.push("");
  lines.push("  Notas");
  lines.push("    · Não abra http://0.0.0.0 no browser");
  if (useTurbo) {
    lines.push("    · Turbopack ativo: a 1.ª visita a cada rota compila sob demanda (rápido)");
    lines.push("    · Forçar Webpack: NEXT_DEV_BUNDLER=webpack npm run dev");
  } else {
    lines.push("    · Webpack: a 1.ª compilação pode demorar 1–3 min");
    lines.push("    · Voltar a Turbopack: remova NEXT_DEV_BUNDLER (é o default)");
  }
  lines.push(`  ${rule}`);
  lines.push("");

  console.log(lines.join("\n"));
}

function sanitizeNextOutput(chunk) {
  return chunk
    .replace(
      new RegExp(`- Local:\\s+http://localhost:${WEB_PORT}`, "g"),
      `- Local:        http://localhost:${WEB_PORT}  (ver banner acima)`
    )
    .replace(
      new RegExp(`- Network:\\s+http://0\\.0\\.0\\.0:${WEB_PORT}`, "g"),
      `- Network:      use um IP do banner (não 0.0.0.0)`
    );
}

printDevBanner();

const bundler = shouldUseTurbo() ? ["--turbopack"] : ["--webpack"];

const child = spawn(
  process.execPath,
  [nextBin, "dev", ...bundler, "-H", "0.0.0.0", "-p", String(WEB_PORT)],
  {
    stdio: ["inherit", "pipe", "inherit"],
    cwd: root,
    env: process.env,
  }
);

child.stdout.on("data", (chunk) => {
  process.stdout.write(sanitizeNextOutput(chunk.toString()));
});

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
