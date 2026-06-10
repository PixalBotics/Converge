/**
 * Validates required NEXT_PUBLIC_* vars before a production build.
 * Loads `.env.production.local`, `.env.production`, then `.env.local`, `.env` (Next.js order).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadMergedEnv() {
  const files = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
  ];
  const merged = {};
  for (const file of files) {
    Object.assign(merged, parseEnvFile(path.join(root, file)));
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_") && value !== undefined) {
      merged[key] = value;
    }
  }
  return merged;
}

const REQUIRED = [
  {
    key: "NEXT_PUBLIC_API_BASE_URL",
    hint: "HTTPS API origin, e.g. https://api.example.com",
  },
];

const RECOMMENDED = [
  {
    key: "NEXT_PUBLIC_WIDGET_EMBED_ORIGIN",
    hint: "This Netlify site URL (NOT Render) — used for embed snippets; preview pages use the live browser host",
  },
  {
    key: "NEXT_PUBLIC_CHAT_SOCKET_BASE_URL",
    hint: "Socket.IO origin (defaults to NEXT_PUBLIC_API_BASE_URL)",
  },
  {
    key: "NEXT_PUBLIC_CHAT_SOCKET_NAMESPACE",
    hint: "Socket namespace (defaults to /chat)",
  },
];

const isNetlify = process.env.NETLIFY === "true";
const isVercel = process.env.VERCEL === "1";
const isCi = process.env.CI === "true";

const env = loadMergedEnv();
const missing = REQUIRED.filter(({ key }) => !String(env[key] ?? "").trim());

if (missing.length > 0) {
  console.error("\n[verify-public-env] Production build blocked — missing public env:\n");
  for (const { key, hint } of missing) {
    console.error(`  • ${key}  (${hint})`);
  }
  if (isVercel) {
    console.error(
      "\nSet variables in Vercel → Project → Settings → Environment Variables (Production).\n",
    );
  } else if (isNetlify || isCi) {
    console.error(
      "\nSet variables in Netlify → Site configuration → Environment variables.\n",
    );
  } else {
    console.error(
      "\nCopy .env.production.example → .env.production.local and set values.\n",
    );
  }
  process.exit(1);
}

for (const { key, hint } of RECOMMENDED) {
  if (!String(env[key] ?? "").trim()) {
    console.warn(`[verify-public-env] Recommended: ${key} — ${hint}`);
  }
}

for (const { key } of REQUIRED) {
  const value = String(env[key]).trim();
  if (/^https?:\/\/localhost/i.test(value) || /^http:\/\//i.test(value)) {
    console.warn(
      `[verify-public-env] Warning: ${key}=${value} — use HTTPS in production when possible.`,
    );
  }
}

console.log("[verify-public-env] Public env OK for production build.");
