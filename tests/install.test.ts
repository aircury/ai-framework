import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkConflicts,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  type InstallFile,
  writeFile,
} from "../src/install";
import { getDefaultSkillGroupIds } from "../src/skills-catalog";

function getFileByPath(files: InstallFile[], path: string): InstallFile {
  const file = files.find((entry) => entry.path === path);
  if (!file) {
    throw new Error(`Expected install file at ${path}`);
  }
  return file;
}

describe("getLocalFiles", () => {
  it("always includes FRAMEWORK.md and AGENTS.md", () => {
    const files = getLocalFiles([]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("FRAMEWORK.md");
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".aircury/framework.config.json");
  });

  it("includes CLAUDE.md when claude-code selected", () => {
    const files = getLocalFiles(["claude-code"]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("CLAUDE.md");
  });

  it("includes GEMINI.md when gemini-cli selected", () => {
    const files = getLocalFiles(["gemini-cli"]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("GEMINI.md");
  });

  it("does not include CLAUDE.md when claude-code not selected", () => {
    const files = getLocalFiles(["gemini-cli"]);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain("CLAUDE.md");
  });

  it("does not include GEMINI.md when gemini-cli not selected", () => {
    const files = getLocalFiles(["claude-code"]);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain("GEMINI.md");
  });

  it("GEMINI.md content matches AGENTS.md content", () => {
    const files = getLocalFiles(["gemini-cli"]);
    const gemini = getFileByPath(files, "GEMINI.md");
    const agents = getFileByPath(files, "AGENTS.md");
    expect(gemini.content).toBe(agents.content);
  });

  it("persists the selected standards modules in a config file", () => {
    const files = getLocalFiles([], ["decision-records", "tdd"]);
    const config = getFileByPath(files, ".aircury/framework.config.json");
    expect(config.content).toContain('"decision-records"');
    expect(config.content).toContain('"testing"');
    expect(config.content).not.toContain('"tdd"');
  });

  it("persists the British English preference in the config file", () => {
    const files = getLocalFiles([], undefined, { britishEnglish: true });
    const config = getFileByPath(files, ".aircury/framework.config.json");
    expect(config.content).toContain('"britishEnglish": true');
  });

  it("generates framework content from the selected modules", () => {
    const files = getLocalFiles([], ["decision-records"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("## Architecture Decision Records");
    expect(framework.content).not.toContain("## TDD Workflow");
    expect(framework.content).not.toContain(
      "## Non-Negotiable Architecture Rules",
    );
  });

  it("includes ADR instructions in AGENTS.md when the ADR module is enabled", () => {
    const files = getLocalFiles([], ["decision-records"]);
    const agents = getFileByPath(files, "AGENTS.md");
    expect(agents.content).toContain("specs/decisions/");
  });

  it("omits ADR instructions when the ADR module is disabled", () => {
    const files = getLocalFiles([], []);
    const agents = getFileByPath(files, "AGENTS.md");
    expect(agents.content).not.toContain("specs/decisions/");
  });

  it("uses the full recommended profile by default", () => {
    const files = getLocalFiles([]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("## TDD Workflow");
    expect(framework.content).toContain("## Non-Negotiable Architecture Rules");
    expect(framework.content).toContain("## Architecture Decision Records");
  });

  it("CLAUDE.md content matches AGENTS.md content", () => {
    const files = getLocalFiles(["claude-code"]);
    const claude = getFileByPath(files, "CLAUDE.md");
    const agents = getFileByPath(files, "AGENTS.md");
    expect(claude.content).toBe(agents.content);
  });

  it("adds British English rules to generated agent files when enabled", () => {
    const files = getLocalFiles([], undefined, { britishEnglish: true });
    const framework = getFileByPath(files, "FRAMEWORK.md");
    const agents = getFileByPath(files, "AGENTS.md");
    expect(framework.content).toContain("Use British English spelling");
    expect(agents.content).toContain("Use British English spelling");
  });
});

describe("frontend module integration", () => {
  it("includes frontendRules/README.md when frontend module is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("frontendRules/README.md");
  });

  it("adds frontend-specific check to FRAMEWORK.md when enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const framework = files.find((f) => f.path === "FRAMEWORK.md");
    expect(framework?.content).toContain(
      "Visual modifications align with the project design system tokens",
    );
  });

  it("includes experience extractor in AGENTS.md when frontend is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const agents = getFileByPath(files, "AGENTS.md");
    expect(agents.content).toContain("frontend-experience-extractor");
  });
});

describe("getGlobalFiles", () => {
  it("returns empty array when no tools selected", () => {
    expect(getGlobalFiles([])).toHaveLength(0);
  });

  it("does not install any global files", () => {
    expect(getGlobalFiles(["claude-code"])).toHaveLength(0);
  });
});

describe("getLocalCommands", () => {
  it("installs the default local skill groups for universal", () => {
    const commands = getLocalCommands([], getDefaultSkillGroupIds("local"));
    expect(commands).toHaveLength(5);
    expect(commands[0]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "aircury/ai-framework",
        "--skill",
        "open-spec-propose",
        "--skill",
        "open-spec-apply",
        "--skill",
        "open-spec-complete",
        "--skill",
        "open-spec-explore",
        "--skill",
        "spec-kit-specify",
        "--skill",
        "spec-kit-clarify",
        "--skill",
        "spec-kit-plan",
        "--skill",
        "spec-kit-analyse",
        "--skill",
        "spec-kit-tasks",
        "--skill",
        "spec-kit-implement",
        "--skill",
        "spec-kit-checklist",
        "--skill",
        "airsync",
        "--skill",
        "commit-changes",
        "-a",
        "universal",
        "-y",
      ],
      description: "Install selected skills from aircury/ai-framework",
    });
    expect(commands[1]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/aj-geddes/useful-ai-prompts",
        "--skill",
        "logging-best-practices",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/aj-geddes/useful-ai-prompts",
    });
    expect(commands[2]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/ccheney/robust-skills",
        "--skill",
        "clean-ddd-hexagonal",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/ccheney/robust-skills",
    });
    expect(commands[3]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/currents-dev/playwright-best-practices-skill",
        "--skill",
        "playwright-best-practices",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/currents-dev/playwright-best-practices-skill",
    });
    expect(commands[4]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/wshobson/agents",
        "--skill",
        "e2e-testing-patterns",
        "--skill",
        "error-handling-patterns",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/wshobson/agents",
    });
  });

  it("installs multiple selected agents in one command", () => {
    const commands = getLocalCommands(["claude-code", "gemini-cli"], ["git"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toEqual([
      "-y",
      "skills",
      "add",
      "aircury/ai-framework",
      "--skill",
      "commit-changes",
      "-a",
      "universal",
      "-a",
      "claude-code",
      "-a",
      "gemini-cli",
      "-y",
    ]);
  });

  it("installs the UK business English skill from its external source", () => {
    const commands = getLocalCommands([], ["language"]);
    expect(commands).toHaveLength(1);
    expect(commands[0]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/jezweb/claude-skills",
        "--skill",
        "uk-business-english",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/jezweb/claude-skills",
    });
  });
});

describe("getGlobalCommands", () => {
  it("returns empty when no global skill agents are selected", () => {
    expect(getGlobalCommands([], ["git"])).toHaveLength(0);
  });

  it("creates a global skills install command for selected agents", () => {
    const commands = getGlobalCommands(["claude-code"], ["git"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toEqual([
      "-y",
      "skills",
      "add",
      "aircury/ai-framework",
      "--skill",
      "commit-changes",
      "-a",
      "claude-code",
      "-g",
      "-y",
    ]);
  });
});

describe("checkConflicts", () => {
  it("marks non-existing files as not conflicting", () => {
    const files = getLocalFiles([]);
    const results = checkConflicts(files, "/nonexistent-path-xyz", false);
    for (const result of results) {
      expect(result.exists).toBe(false);
    }
  });

  it("marks existing files as conflicting", () => {
    // templates/framework.md.hbs exists in the project root — use that as cwd
    const cwd = join(import.meta.dir, "..");
    const files = [
      { path: "templates/framework.md.hbs", content: "", description: "" },
    ];
    const results = checkConflicts(files, cwd, false);
    expect(results[0].exists).toBe(true);
  });
});

describe("writeFile", () => {
  it("writes a local file to the correct path under cwd", () => {
    const dir = `${tmpdir()}/sdd-test-${Date.now()}`;
    const file = {
      path: "subdir/test.md",
      content: "# hello",
      description: "",
    };

    writeFile(file, dir, false);

    const fullPath = join(dir, "subdir/test.md");
    expect(existsSync(fullPath)).toBe(true);
    expect(readFileSync(fullPath, "utf-8")).toBe("# hello");

    rmSync(dir, { recursive: true });
  });

  it("writes a global file using the absolute path directly", () => {
    const dir = `${tmpdir()}/sdd-global-test-${Date.now()}`;
    const file = {
      path: `${dir}/commands/skill.md`,
      content: "# skill",
      description: "",
    };

    writeFile(file, "/irrelevant", true);

    expect(existsSync(file.path)).toBe(true);
    expect(readFileSync(file.path, "utf-8")).toBe("# skill");

    rmSync(dir, { recursive: true });
  });

  it("creates intermediate directories as needed", () => {
    const dir = `${tmpdir()}/sdd-mkdir-test-${Date.now()}`;
    const file = { path: "a/b/c/deep.md", content: "deep", description: "" };

    writeFile(file, dir, false);

    expect(existsSync(join(dir, "a/b/c/deep.md"))).toBe(true);

    rmSync(dir, { recursive: true });
  });
});
