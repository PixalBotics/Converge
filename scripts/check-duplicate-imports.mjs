/**
 * Fails the build when the same single-line import appears twice in a file
 * (e.g. duplicate `import Chip from "@mui/material/Chip"` — breaks webpack on Netlify).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".next-dev", ".next-release", "out", "dist"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function isSingleLineImport(line) {
  const t = line.trim();
  if (!t.startsWith("import ")) return false;
  if (t.startsWith("import {") || t.startsWith("import type {")) return false;
  return true;
}

const problems = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const seen = new Map();
  for (const line of lines) {
    if (!isSingleLineImport(line)) continue;
    const key = line.trim();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [stmt, count] of seen) {
    if (count > 1) problems.push({ rel, stmt, count });
  }
}

if (problems.length > 0) {
  console.error("\n[check-duplicate-imports] Duplicate import lines found:\n");
  for (const { rel, stmt, count } of problems) {
    console.error(`  ${rel} (${count}x)\n    ${stmt}\n`);
  }
  process.exit(1);
}

console.log("[check-duplicate-imports] OK");
