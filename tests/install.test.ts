import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getInitialCapabilityIds } from "../src/capabilities";
import {
  checkConflicts,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  type InstallFile,
  mergeFrameworkReferenceIntoAgents,
  writeFile,
} from "../src/install";

function getFileByPath(files: InstallFile[], path: string): InstallFile {
  const file = files.find((entry) => entry.path === path);
  if (!file) {
    throw new Error(`Expected install file at ${path}`);
  }
  return file;
}

describe("getLocalFiles", () => {
  it("always includes the core framework files", () => {
    const files = getLocalFiles([]);
    const paths = files.map((file) => file.path);
    expect(paths).toContain("FRAMEWORK.md");
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".aircury/framework.config.json");
    expect(paths).toContain("specs/features/README.md");
  });

  it("includes CLAUDE.md when Claude Code is selected", () => {
    const files = getLocalFiles(["claude-code"]);
    expect(files.map((file) => file.path)).toContain("CLAUDE.md");
  });

  it("includes GEMINI.md when Gemini CLI is selected", () => {
    const files = getLocalFiles(["gemini-cli"]);
    expect(files.map((file) => file.path)).toContain("GEMINI.md");
  });

  it("persists selected capabilities in the config file", () => {
    const files = getLocalFiles([], ["decision-records", "testing"]);
    const config = getFileByPath(files, ".aircury/framework.config.json");
    expect(config.content).toContain('"capabilities": [');
    expect(config.content).toContain('"decision-records"');
    expect(config.content).toContain('"testing"');
    expect(config.content).not.toContain('"git"');
  });

  it("persists the British English preference in the config file", () => {
    const files = getLocalFiles([], undefined, { britishEnglish: true });
    const config = getFileByPath(files, ".aircury/framework.config.json");
    expect(config.content).toContain('"britishEnglish": true');
    expect(config.content).toContain('"language"');
  });

  it("generates framework content from the selected capabilities", () => {
    const files = getLocalFiles([], ["decision-records"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("## Architecture Decision Records");
    expect(framework.content).not.toContain("## TDD Workflow");
    expect(framework.content).not.toContain(
      "## Non-Negotiable Architecture Rules",
    );
  });

  it("keeps AGENTS.md focused on the framework reference", () => {
    const withCapabilities = getLocalFiles(
      [],
      ["decision-records", "code-style"],
    );
    const withoutCapabilities = getLocalFiles([], []);
    const agentsWithCapabilities = getFileByPath(withCapabilities, "AGENTS.md");
    const agentsWithoutCapabilities = getFileByPath(
      withoutCapabilities,
      "AGENTS.md",
    );
    expect(agentsWithCapabilities.content).toBe(
      agentsWithoutCapabilities.content,
    );
    expect(agentsWithCapabilities.content).toContain("FRAMEWORK.md");
    expect(agentsWithCapabilities.content).toContain("single source of truth");
  });

  it("uses the full recommended profile by default", () => {
    const files = getLocalFiles([]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("## TDD Workflow");
    expect(framework.content).toContain("## Non-Negotiable Architecture Rules");
    expect(framework.content).toContain("## Architecture Decision Records");
    expect(framework.content).toContain("## Token Efficiency");
  });

  it("adds capability-owned files when selected", () => {
    const files = getLocalFiles([], ["frontend", "decision-records"]);
    const paths = files.map((file) => file.path);
    expect(paths).toContain("specs/ui/README.md");
    expect(paths).toContain("specs/decisions/README.md");
  });

  it("adds frontend-specific check to FRAMEWORK.md when enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain(
      "Visual modifications align with the project design system tokens",
    );
  });

  it("includes experience extractor in FRAMEWORK.md when frontend is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("frontend-experience-extractor");
  });

  it("includes terse-response guidance in FRAMEWORK.md when token-efficiency is enabled", () => {
    const files = getLocalFiles([], ["token-efficiency"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain(
      "Load and apply the `caveman` skill in `full` mode",
    );
    expect(framework.content).toContain("ACTIVE EVERY RESPONSE");
    expect(framework.content).toContain("stop caveman");
  });
});

describe("getGlobalFiles", () => {
  it("does not install any global files", () => {
    expect(getGlobalFiles(["claude-code"])).toHaveLength(0);
  });
});

describe("getLocalCommands", () => {
  it("installs the default local capabilities for universal agents", () => {
    const commands = getLocalCommands([], getInitialCapabilityIds("local"));
    expect(commands).toHaveLength(6);
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
        "--skill",
        "frontend-layout-extractor",
        "--skill",
        "frontend-experience-extractor",
        "--skill",
        "frontend-ui-generator",
        "--skill",
        "specs-extractor",
        "--skill",
        "specs-interpreter",
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
        "https://github.com/juliusbrussee/caveman",
        "--skill",
        "caveman",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/juliusbrussee/caveman",
    });
    expect(commands[5]).toEqual({
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
  it("installs the caveman skill from its external source", () => {
    const commands = getLocalCommands([], ["token-efficiency"]);
    expect(commands).toHaveLength(1);
    expect(commands[0]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/juliusbrussee/caveman",
        "--skill",
        "caveman",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/juliusbrussee/caveman",
    });
  });

  it("installs the specs skills from the Aircury source", () => {
    const commands = getLocalCommands([], ["specs"]);
    expect(commands).toHaveLength(1);
    expect(commands[0]).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "aircury/ai-framework",
        "--skill",
        "specs-extractor",
        "--skill",
        "specs-interpreter",
        "-a",
        "universal",
        "-y",
      ],
      description: "Install selected skills from aircury/ai-framework",
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

  it("merges the framework reference into an existing local AGENTS.md", () => {
    const dir = `${tmpdir()}/sdd-agents-merge-${Date.now()}`;
    const file = getFileByPath(getLocalFiles([]), "AGENTS.md");

    writeFile(
      {
        path: "AGENTS.md",
        content: "# Existing\n\nProject-specific instructions.",
        description: "",
      },
      dir,
      false,
    );
    writeFile(file, dir, false);

    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    expect(content).toContain("Project-specific instructions.");
    expect(content).toContain(
      "This project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).",
    );

    rmSync(dir, { recursive: true });
  });

  it("replaces a legacy generated AGENTS.md with the new reference-only version", () => {
    const dir = `${tmpdir()}/sdd-agents-replace-${Date.now()}`;
    const file = getFileByPath(getLocalFiles([]), "AGENTS.md");

    writeFile(
      {
        path: "AGENTS.md",
        content: `# AGENTS.md\n\n## Framework\n\nThis project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).\n\nAll agents contributing to this repository MUST read and apply FRAMEWORK.md before doing any work. It is not optional and it is not advisory.\n\n## Before starting any task\n\n- Legacy content.`,
        description: "",
      },
      dir,
      false,
    );
    writeFile(file, dir, false);

    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    expect(content).not.toContain("Legacy content.");
    expect(content).toBe(file.content);

    rmSync(dir, { recursive: true });
  });
});

describe("mergeFrameworkReferenceIntoAgents", () => {
  it("keeps an existing framework reference idempotent", () => {
    const content =
      "# Custom\n\nThis project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).\n";
    expect(
      mergeFrameworkReferenceIntoAgents(content, "# AGENTS.md\n\nReference"),
    ).toBe(
      "# Custom\n\nThis project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).\n",
    );
  });
});
