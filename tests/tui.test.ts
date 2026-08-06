import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Writable } from "node:stream";
import type { InstallCommand } from "../src/install";
import { runInstaller } from "../src/tui";

class InstallerInput extends Readable {
  override _read(): void {}

  press(name: string, value = ""): void {
    this.emit("keypress", value, { name });
  }
}

class InstallerOutput extends Writable {
  readonly isTTY = false;
  readonly columns = 120;
  readonly rows = 40;
  private content = "";

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.content += chunk.toString();
    callback();
  }

  get text(): string {
    return this.content;
  }

  async waitFor(expected: string): Promise<void> {
    const deadline = Date.now() + 2_000;

    while (!this.content.includes(expected)) {
      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for installer output: ${expected}`);
      }
      await Bun.sleep(5);
    }
  }
}

const temporaryDirectories: string[] = [];

function createTemporaryDirectory(name: string): string {
  const directory = mkdtempSync(join(tmpdir(), `${name}-`));
  temporaryDirectories.push(directory);
  return directory;
}

async function answerPrompt(
  output: InstallerOutput,
  input: InstallerInput,
  message: string,
  name = "return",
  value = "",
): Promise<void> {
  await output.waitFor(message);
  input.press(name, value);
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("runInstaller", () => {
  it("cancels without changing the project", async () => {
    const cwd = createTemporaryDirectory("ai-framework-cancel");
    const input = new InstallerInput();
    const output = new InstallerOutput();
    const installation = runInstaller({
      cwd,
      input,
      output,
      executeCommand: () => {
        throw new Error("No command should run after cancellation");
      },
    });

    await answerPrompt(
      output,
      input,
      "What do you want to configure?",
      "escape",
      "escape",
    );
    await installation;

    expect(output.text).toContain("Cancelled.");
    expect(existsSync(join(cwd, "FRAMEWORK.md"))).toBe(false);
  });

  it("installs the default local workflow through injected streams", async () => {
    const cwd = createTemporaryDirectory("ai-framework-install");
    const input = new InstallerInput();
    const output = new InstallerOutput();
    const executedCommands: InstallCommand[] = [];
    const installation = runInstaller({
      cwd,
      input,
      output,
      executeCommand: (command) => {
        executedCommands.push(command);
        return { success: true, stdout: "", stderr: "" };
      },
    });

    await answerPrompt(output, input, "What do you want to configure?");
    await answerPrompt(output, input, "Additional tools");
    await answerPrompt(output, input, "Use British English");
    await answerPrompt(output, input, "Architecture capability");
    await answerPrompt(output, input, "Other capabilities");
    await answerPrompt(output, input, "Proceed with installation?", "y", "y");
    await installation;

    expect(readFileSync(join(cwd, "FRAMEWORK.md"), "utf-8")).toContain(
      "# FRAMEWORK.md",
    );
    expect(existsSync(join(cwd, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(cwd, "GEMINI.md"))).toBe(true);
    expect(executedCommands.length).toBeGreaterThan(0);
    expect(
      executedCommands.every(
        ({ args }) =>
          args.includes("universal") &&
          args.includes("claude-code") &&
          args.includes("gemini-cli"),
      ),
    ).toBe(true);
    expect(output.text).toContain("Aircury AI Framework ready.");
  });
});
