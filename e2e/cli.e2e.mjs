import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { spawn } from "@lydell/node-pty";

function createRecordingNpx(binDirectory) {
  const recorderPath = join(binDirectory, "record-npx.cjs");
  const recorder = `const { appendFileSync } = require("node:fs");
const args = process.argv.slice(2);
if (!args.includes("--version")) {
  appendFileSync(process.env.AI_FRAMEWORK_E2E_COMMAND_LOG, JSON.stringify(args) + "\\n");
}
`;
  writeFileSync(recorderPath, recorder, "utf-8");

  if (process.platform === "win32") {
    writeFileSync(
      join(binDirectory, "npx.cmd"),
      `@echo off\r\nnode "%~dp0\\record-npx.cjs" %*\r\n`,
      "utf-8",
    );
    return;
  }

  const executablePath = join(binDirectory, "npx");
  writeFileSync(executablePath, `#!/usr/bin/env node\n${recorder}`, "utf-8");
  chmodSync(executablePath, 0o755);
}

function createTerminalDriver(terminal) {
  let transcript = "";
  terminal.onData((data) => {
    transcript += data;
  });

  return {
    get transcript() {
      return transcript;
    },
    async answer(message, input = "\r") {
      const deadline = Date.now() + 5_000;

      while (!transcript.includes(message)) {
        if (Date.now() >= deadline) {
          throw new Error(
            `Timed out waiting for CLI output: ${message}\n${transcript}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      terminal.write(input);
    },
  };
}

function createExitMonitor(terminal) {
  let exitResult;
  const waiters = [];

  terminal.onExit((result) => {
    exitResult = result;
    for (const waiter of waiters.splice(0)) {
      waiter(result);
    }
  });

  return {
    wait() {
      if (exitResult) return Promise.resolve(exitResult);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timed out waiting for the CLI to exit")),
          5_000,
        );
        waiters.push((result) => {
          clearTimeout(timeout);
          resolve(result);
        });
      });
    },
  };
}

test("installs a project through the built interactive CLI", {
  timeout: 20_000,
}, async () => {
  const testRoot = mkdtempSync(join(tmpdir(), "ai-framework-cli-e2e-"));
  const projectDirectory = join(testRoot, "project");
  const binDirectory = join(testRoot, "bin");
  const commandLogPath = join(testRoot, "commands.ndjson");
  const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  let terminal;

  mkdirSync(projectDirectory, { recursive: true });
  mkdirSync(binDirectory, { recursive: true });
  createRecordingNpx(binDirectory);

  try {
    terminal = spawn(
      process.execPath,
      [join(repositoryRoot, "dist", "cli.js")],
      {
        name: "xterm-256color",
        cols: 120,
        rows: 40,
        cwd: projectDirectory,
        env: {
          ...process.env,
          AIRCURY_SKILLS_SOURCE: repositoryRoot,
          AI_FRAMEWORK_E2E_COMMAND_LOG: commandLogPath,
          PATH: `${binDirectory}${delimiter}${process.env.PATH ?? ""}`,
        },
      },
    );
    const driver = createTerminalDriver(terminal);
    const exit = createExitMonitor(terminal);

    await driver.answer("What do you want to configure?");
    await driver.answer("Additional tools");
    await driver.answer("Use British English");
    await driver.answer("Architecture capability");
    await driver.answer("Other capabilities");
    await driver.answer("Proceed with installation?", "y");
    await driver.answer("Aircury AI Framework ready.", "");

    const result = await exit.wait();
    const commands = readFileSync(commandLogPath, "utf-8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    assert.equal(result.exitCode, 0);
    assert.equal(existsSync(join(projectDirectory, "FRAMEWORK.md")), true);
    assert.equal(existsSync(join(projectDirectory, "CLAUDE.md")), true);
    assert.equal(existsSync(join(projectDirectory, "GEMINI.md")), true);
    assert.ok(commands.length > 0);
    assert.equal(
      commands.every(
        (args) =>
          args.includes("universal") &&
          args.includes("claude-code") &&
          args.includes("gemini-cli"),
      ),
      true,
    );
    assert.match(driver.transcript, /Aircury AI Framework ready\./);
  } finally {
    try {
      terminal?.kill();
    } catch {}
    rmSync(testRoot, { recursive: true, force: true });
  }
});
