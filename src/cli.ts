#!/usr/bin/env node
import { runCommand } from "./install";
import { run } from "./tui";
import { runUpdate } from "./update";

const USAGE = `Usage: ai-framework [--update [--dry-run]]

  (no options)   interactive installer
  --update       update this project from its saved .aircury/framework.config.json, without prompts
  --dry-run      with --update: print the plan and write nothing`;

const args = process.argv.slice(2);
const known = new Set(["--update", "--dry-run", "--help", "-h"]);
const unknown = args.filter((arg) => !known.has(arg));

if (args.includes("--help") || args.includes("-h")) {
  console.log(USAGE);
} else if (
  unknown.length > 0 ||
  (args.includes("--dry-run") && !args.includes("--update"))
) {
  console.error(USAGE);
  process.exit(2);
} else if (args.includes("--update")) {
  const { ok } = runUpdate({
    cwd: process.cwd(),
    dryRun: args.includes("--dry-run"),
    log: (line) => console.log(line),
    executeCommand: runCommand,
  });
  process.exit(ok ? 0 : 1);
} else {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
