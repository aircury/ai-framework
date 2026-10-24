import { afterEach, describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCapabilityProfile } from "../src/capabilities";
import type { InstallCommand } from "../src/install";
import { runUpdate } from "../src/update";

const directories: string[] = [];

function project(): string {
  const dir = mkdtempSync(join(tmpdir(), "ai-framework-update-"));
  directories.push(dir);
  return dir;
}

function put(dir: string, path: string, content: string): void {
  mkdirSync(join(dir, path, ".."), { recursive: true });
  writeFileSync(join(dir, path), content);
}

function saveProfile(dir: string, capabilities: string[]): void {
  const profile = createCapabilityProfile(capabilities as never, {
    britishEnglish: true,
    tools: ["claude-code"],
  });
  put(
    dir,
    ".aircury/framework.config.json",
    `${JSON.stringify(profile, null, 2)}\n`,
  );
}

function run(dir: string, dryRun = false) {
  const lines: string[] = [];
  const commands: InstallCommand[] = [];
  const result = runUpdate({
    cwd: dir,
    dryRun,
    frameworkVersion: "9.9.9",
    log: (line) => lines.push(line),
    executeCommand: (command) => {
      commands.push(command);
      return { success: true, stdout: "", stderr: "" };
    },
  });
  return { result, output: lines.join("\n"), commands };
}

afterEach(() => {
  for (const dir of directories.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("runUpdate", () => {
  it("refuses a project without a saved profile", () => {
    const dir = project();
    const { result, output } = run(dir);
    expect(result.ok).toBe(false);
    expect(output).toContain(".aircury/framework.config.json");
    expect(existsSync(join(dir, "FRAMEWORK.md"))).toBe(false);
  });

  it("reinstalls from the saved profile without asking", () => {
    const dir = project();
    saveProfile(dir, ["git", "frontend"]);
    put(dir, "FRAMEWORK.md", "# FRAMEWORK.md\n\nOld.\n");
    put(dir, "specs/features/README.md", "# Ours\n");
    put(
      dir,
      "docs/aircury/capabilities/airsync.md",
      "# Airsync\n\n> This file is maintained by Aircury AI Framework.\n",
    );

    const { result, output, commands } = run(dir);

    expect(result.ok).toBe(true);
    expect(readFileSync(join(dir, "FRAMEWORK.md"), "utf8")).toContain(
      "frontend",
    );
    expect(readFileSync(join(dir, "specs/features/README.md"), "utf8")).toBe(
      "# Ours\n",
    );
    expect(existsSync(join(dir, "docs/aircury/capabilities/airsync.md"))).toBe(
      false,
    );
    expect(
      JSON.parse(
        readFileSync(join(dir, ".aircury/framework.config.json"), "utf8"),
      ).frameworkVersion,
    ).toBe("9.9.9");
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toContain(
      "specs/changes/",
    );
    expect(commands.length).toBeGreaterThan(0);
    expect(output).toContain("refresh FRAMEWORK.md");
    expect(output).toContain("keep specs/features/README.md");
    expect(output).toContain("remove docs/aircury/capabilities/airsync.md");
  });

  it("installs no skills into a skills submodule", () => {
    const dir = project();
    saveProfile(dir, ["git"]);
    put(
      dir,
      ".gitmodules",
      '[submodule ".agents/skills"]\n\tpath = .agents/skills\n\turl = git@github.com:example/skills.git\n',
    );
    put(dir, ".agents/skills/commit-changes/SKILL.md", "---\n---\n");

    const { result, output, commands } = run(dir);

    expect(result.ok).toBe(true);
    expect(commands).toEqual([]);
    expect(output).toContain(".agents/skills is a git submodule");
  });

  it("only reports the plan on a dry run", () => {
    const dir = project();
    saveProfile(dir, ["git"]);
    put(dir, "FRAMEWORK.md", "# FRAMEWORK.md\n\nOld.\n");

    const { result, output, commands } = run(dir, true);

    expect(result.ok).toBe(true);
    expect(output).toContain("refresh FRAMEWORK.md");
    expect(readFileSync(join(dir, "FRAMEWORK.md"), "utf8")).toContain("Old.");
    expect(commands).toEqual([]);
  });

  it("writes no files when a skill installation fails", () => {
    const dir = project();
    saveProfile(dir, ["git"]);
    const result = runUpdate({
      cwd: dir,
      log: () => {},
      executeCommand: () => ({ success: false, stdout: "", stderr: "boom" }),
    });
    expect(result.ok).toBe(false);
    expect(existsSync(join(dir, "FRAMEWORK.md"))).toBe(false);
  });

  it("says when the skills submodule is not initialised instead of listing every skill as missing", () => {
    const dir = project();
    saveProfile(dir, ["git"]);
    put(
      dir,
      ".gitmodules",
      '[submodule ".agents/skills"]\n\tpath = .agents/skills\n\turl = git@github.com:example/skills.git\n',
    );

    const { output } = run(dir, true);

    expect(output).toContain("git submodule update --init");
    expect(output).not.toContain("Not in the submodule");
  });
});
