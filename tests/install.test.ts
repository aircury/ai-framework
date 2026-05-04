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

function getCommandBySource(
  commands: ReturnType<typeof getLocalCommands>,
  source: string,
) {
  const command = commands.find((entry) => entry.args.includes(source));
  if (!command) {
    throw new Error(`Expected install command for ${source}`);
  }
  return command;
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

  it("keeps AGENTS.md stable when token-efficiency selection is unchanged", () => {
    const first = getLocalFiles([], ["decision-records"]);
    const second = getLocalFiles([], ["code-style"]);
    const firstAgents = getFileByPath(first, "AGENTS.md");
    const secondAgents = getFileByPath(second, "AGENTS.md");
    expect(firstAgents.content).toBe(secondAgents.content);
    expect(firstAgents.content).toContain("FRAMEWORK.md");
    expect(firstAgents.content).toContain("## Session Checklist");
  });

  it("adds caveman-full guidance to AGENTS.md when token-efficiency is enabled", () => {
    const files = getLocalFiles([], ["token-efficiency"]);
    const agents = getFileByPath(files, "AGENTS.md");
    expect(agents.content).toContain(
      "the `caveman` skill is available but not enabled automatically",
    );
    expect(agents.content).toContain(
      "activate it explicitly with `caveman full`",
    );
  });

  it("uses the full recommended profile by default", () => {
    const files = getLocalFiles([]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("## TDD Workflow");
    expect(framework.content).toContain("## Non-Negotiable Architecture Rules");
    expect(framework.content).toContain("## Architecture Decision Records");
    expect(framework.content).toContain("## Token Efficiency");
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
    expect(agents.content).not.toContain("Use British English spelling");
  });
});

describe("frontend module integration", () => {
  it("includes specs/ui/README.md when frontend module is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("specs/ui/README.md");
  });

  it("includes a frontend workflow reference when frontend module is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("specs/ui/frontend-workflow.md");
  });

  it("adds frontend-specific check to FRAMEWORK.md when enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const framework = files.find((f) => f.path === "FRAMEWORK.md");
    expect(framework?.content).toContain(
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
      "activate `caveman` explicitly with `caveman full`",
    );
    expect(framework.content).toContain("stop caveman");
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
  it("installs the skills derived from the default capabilities for universal", () => {
    const commands = getLocalCommands([]);

    expect(commands).toHaveLength(6);
    const aircury = getCommandBySource(commands, "aircury/ai-framework");
    expect(aircury.args).toContain("open-spec-propose");
    expect(aircury.args).toContain("spec-kit-specify");
    expect(aircury.args).toContain("airsync");
    expect(aircury.args).toContain("commit-changes");
    expect(aircury.args).toContain("frontend-layout-extractor");
    expect(aircury.args).toContain("specs-extractor");
    expect(
      getCommandBySource(
        commands,
        "https://github.com/aj-geddes/useful-ai-prompts",
      ).args,
    ).toContain("logging-best-practices");
    expect(
      getCommandBySource(commands, "https://github.com/ccheney/robust-skills")
        .args,
    ).toContain("clean-ddd-hexagonal");
    expect(
      getCommandBySource(
        commands,
        "https://github.com/currents-dev/playwright-best-practices-skill",
      ).args,
    ).toContain("playwright-best-practices");
    expect(
      getCommandBySource(commands, "https://github.com/juliusbrussee/caveman")
        .args,
    ).toContain("caveman");
    expect(
      getCommandBySource(commands, "https://github.com/wshobson/agents").args,
    ).toContain("error-handling-patterns");
    expect(
      getCommandBySource(commands, "https://github.com/wshobson/agents").args,
    ).toContain("e2e-testing-patterns");
  });

  it("installs multiple selected agents in each derived command", () => {
    const commands = getLocalCommands(
      ["claude-code", "gemini-cli"],
      ["decision-records"],
    );
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toEqual([
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
      "specs-extractor",
      "--skill",
      "specs-interpreter",
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
    const commands = getLocalCommands([], [], { britishEnglish: true });
    expect(
      getCommandBySource(commands, "https://github.com/jezweb/claude-skills")
        .args,
    ).toContain("uk-business-english");
  });

  it("installs the caveman skill when token-efficiency capability is selected", () => {
    const commands = getLocalCommands([], ["token-efficiency"]);
    expect(
      getCommandBySource(commands, "https://github.com/juliusbrussee/caveman")
        .args,
    ).toContain("caveman");
  });

  it("installs capability-required skills without a separate skill selection", () => {
    const commands = getLocalCommands([], ["frontend", "token-efficiency"]);

    expect(commands).toHaveLength(2);
    expect(commands[0].args).toContain("commit-changes");
    expect(commands[0].args).toContain("frontend-layout-extractor");
    expect(commands[0].args).toContain("frontend-experience-extractor");
    expect(commands[0].args).toContain("frontend-ui-generator");
    expect(commands[1].args).toContain("caveman");
  });

  it("installs the specs skills from the Aircury source", () => {
    const commands = getLocalCommands([], []);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("specs-extractor");
    expect(commands[0].args).toContain("specs-interpreter");
  });
});

describe("getGlobalCommands", () => {
  it("installs global skills for universal from selected capabilities", () => {
    const commands = getGlobalCommands([], ["token-efficiency"]);
    expect(commands).toHaveLength(2);
    expect(getCommandBySource(commands, "aircury/ai-framework").args).toContain(
      "-g",
    );
    expect(
      getCommandBySource(commands, "https://github.com/juliusbrussee/caveman")
        .args,
    ).toContain("caveman");
  });

  it("creates a global skills install command for selected agents", () => {
    const commands = getGlobalCommands(["claude-code"], []);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("-a");
    expect(commands[0].args).toContain("universal");
    expect(commands[0].args).toContain("claude-code");
    expect(commands[0].args).toContain("-g");
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
    expect(content).toContain("## Session Checklist");

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
    expect(content).toBe(file.content);

    rmSync(dir, { recursive: true });
  });
});

describe("mergeFrameworkReferenceIntoAgents", () => {
  const frameworkReference = getFileByPath(
    getLocalFiles([]),
    "AGENTS.md",
  ).content;

  it("appends the framework reference when missing", () => {
    const merged = mergeFrameworkReferenceIntoAgents(
      "# Existing\n\nProject-specific instructions.",
      frameworkReference,
    );

    expect(merged).toContain("Project-specific instructions.");
    expect(merged).toContain("## Session Checklist");
  });

  it("does not duplicate the framework reference when already present", () => {
    const existing = `# Existing\n\nProject-specific instructions.\n\n${frameworkReference}`;
    const merged = mergeFrameworkReferenceIntoAgents(
      existing,
      frameworkReference,
    );

    expect(merged).toBe(existing.endsWith("\n") ? existing : `${existing}\n`);
  });
});
