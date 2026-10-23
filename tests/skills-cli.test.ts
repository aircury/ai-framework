import { afterEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsCliPath = join(
  repositoryRoot,
  "node_modules",
  "skills",
  "bin",
  "cli.mjs",
);
const temporaryDirectories: string[] = [];

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "ai-framework-skills-cli-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("Skills CLI integration", () => {
  it("links the Claude Code skill to the canonical Universal installation", () => {
    const cwd = createTemporaryDirectory();
    const result = spawnSync(
      process.execPath,
      [
        skillsCliPath,
        "add",
        repositoryRoot,
        "--skill",
        "commit-changes",
        "-a",
        "universal",
        "-a",
        "claude-code",
        "-y",
      ],
      {
        cwd,
        encoding: "utf-8",
        env: {
          ...process.env,
          CI: "1",
          DISABLE_TELEMETRY: "1",
        },
        timeout: 10_000,
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    const canonicalSkillPath = join(cwd, ".agents", "skills", "commit-changes");
    const claudeSkillPath = join(cwd, ".claude", "skills", "commit-changes");
    expect(existsSync(join(canonicalSkillPath, "SKILL.md"))).toBe(true);
    expect(lstatSync(claudeSkillPath).isSymbolicLink()).toBe(true);
    expect(realpathSync(claudeSkillPath)).toBe(
      realpathSync(canonicalSkillPath),
    );
  });
});
