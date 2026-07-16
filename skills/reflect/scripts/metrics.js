#!/usr/bin/env node
// metrics.js — measured metrics for the /reflect chat report.
// Reads the current session's transcript JSONL (+ all subagent transcripts)
// and prints a JSON object. No dependencies.
//
// Usage:
//   node metrics.js                         # auto-locate from cwd
//   node metrics.js --file <session.jsonl>  # explicit main transcript
//   node metrics.js --extra <a.jsonl> ...   # continuation/checkpoint files
//   node metrics.js --cache-ttl 5m          # cache-write pricing (default 1h)

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

// USD per 1M tokens: [input, output]. Cache read = 0.1x input;
// cache write = 2x input (1h TTL, Claude Code default) or 1.25x (5m).
const RATES = [
  { match: /fable-5|mythos-5/, in: 10, out: 50, label: "fable-5" },
  { match: /opus/, in: 5, out: 25, label: "opus" },
  { match: /sonnet/, in: 3, out: 15, label: "sonnet" },
  { match: /haiku/, in: 1, out: 5, label: "haiku" },
];

function parseArgs(argv) {
  const args = { extra: [], cacheTtl: "1h", file: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--file") args.file = argv[++i];
    else if (argv[i] === "--extra") args.extra.push(argv[++i]);
    else if (argv[i] === "--cache-ttl") args.cacheTtl = argv[++i];
  }
  return args;
}

function projectDir() {
  const munged = process.cwd().replace(/[/.]/g, "-");
  return path.join(os.homedir(), ".claude", "projects", munged);
}

function newestJsonl(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => path.join(dir, f))
    .filter((f) => fs.statSync(f).isFile());
  if (!files.length) throw new Error("no .jsonl transcripts in " + dir);
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function findAgentFiles(dir) {
  // Recursively collect agent transcript jsonl files under <sessionDir>.
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findAgentFiles(p));
    else if (entry.name.startsWith("agent-") && entry.name.endsWith(".jsonl"))
      out.push(p);
  }
  return out;
}

function scanFile(file, acc) {
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (o.timestamp) {
      const t = new Date(o.timestamp).getTime();
      if (!Number.isNaN(t)) {
        if (acc.tmin === null || t < acc.tmin) acc.tmin = t;
        if (acc.tmax === null || t > acc.tmax) acc.tmax = t;
      }
    }
    const msg = o.message;
    if (msg && msg.usage) {
      acc.apiCalls++;
      acc.in += msg.usage.input_tokens || 0;
      acc.cacheW += msg.usage.cache_creation_input_tokens || 0;
      acc.cacheR += msg.usage.cache_read_input_tokens || 0;
      acc.out += msg.usage.output_tokens || 0;
      if (msg.model) acc.model = msg.model;
    }
    if (o.type === "user" && msg && msg.content && !o.isMeta) {
      const c = msg.content;
      const isText =
        typeof c === "string" ||
        (Array.isArray(c) && c.some((p) => p.type === "text"));
      const onlyToolResults =
        Array.isArray(c) &&
        c.length > 0 &&
        c.every((p) => p.type === "tool_result");
      if (isText && !onlyToolResults) acc.userMessages++;
    }
  }
}

function newAcc() {
  return {
    in: 0,
    cacheW: 0,
    cacheR: 0,
    out: 0,
    apiCalls: 0,
    userMessages: 0,
    tmin: null,
    tmax: null,
    model: null,
  };
}

function fmtTokens(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 10e6 ? 1 : 2) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(n);
}

function fmtDuration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return m + "m";
  return Math.floor(m / 60) + "h" + String(m % 60).padStart(2, "0");
}

function main() {
  const args = parseArgs(process.argv);
  const mainFile = args.file || newestJsonl(projectDir());
  const sessionId = path.basename(mainFile, ".jsonl");
  const sessionDir = path.join(path.dirname(mainFile), sessionId);

  const mainAcc = newAcc();
  scanFile(mainFile, mainAcc);
  for (const extra of args.extra) scanFile(extra, mainAcc);

  const agentFiles = findAgentFiles(sessionDir);
  const subAcc = newAcc();
  for (const f of agentFiles) scanFile(f, subAcc);

  const model = mainAcc.model || "unknown";
  const rate = RATES.find((r) => r.match.test(model)) || RATES[0];
  const cwMult = args.cacheTtl === "5m" ? 1.25 : 2;

  const tot = {
    in: mainAcc.in + subAcc.in,
    cacheW: mainAcc.cacheW + subAcc.cacheW,
    cacheR: mainAcc.cacheR + subAcc.cacheR,
    out: mainAcc.out + subAcc.out,
  };
  const processed = tot.in + tot.cacheW + tot.cacheR + tot.out;
  const cost =
    (tot.in * rate.in +
      tot.cacheW * rate.in * cwMult +
      tot.cacheR * rate.in * 0.1 +
      tot.out * rate.out) /
    1e6;

  const wallMs = (mainAcc.tmax || 0) - (mainAcc.tmin || 0);

  console.log(
    JSON.stringify(
      {
        sessionFile: mainFile,
        model,
        rateCard: {
          label: rate.label,
          inputPerM: rate.in,
          outputPerM: rate.out,
          cacheWriteMult: cwMult,
          cacheReadMult: 0.1,
        },
        subagents: agentFiles.length,
        wall: { ms: wallMs, human: fmtDuration(wallMs) },
        userMessages: mainAcc.userMessages,
        apiCalls: mainAcc.apiCalls + subAcc.apiCalls,
        tokens: {
          main: {
            in: mainAcc.in,
            cacheWrite: mainAcc.cacheW,
            cacheRead: mainAcc.cacheR,
            out: mainAcc.out,
          },
          subagents: {
            in: subAcc.in,
            cacheWrite: subAcc.cacheW,
            cacheRead: subAcc.cacheR,
            out: subAcc.out,
          },
          generated: tot.out,
          generatedHuman: fmtTokens(tot.out),
          processed,
          processedHuman: fmtTokens(processed),
          cacheReadsHuman: fmtTokens(tot.cacheR),
        },
        cost: {
          usd: Math.round(cost * 100) / 100,
          human: "$" + cost.toFixed(2),
        },
      },
      null,
      2,
    ),
  );
}

main();
