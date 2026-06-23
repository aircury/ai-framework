import { describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FRAMEWORK_MAINTAINED_NOTICE,
  getCapabilitySkills,
  getInitialCapabilityIds,
} from "../src/capabilities";
import {
  checkConflicts,
  getAircurySkillsSource,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  type InstallFile,
  isMergeableFrameworkEntrypoint,
  isProtectedLocalCompanion,
  mergeFrameworkReferenceIntoAgents,
  runCommand,
  syncClaudeCodeSkills,
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

const aircurySkillsSource = getAircurySkillsSource();
const aircurySkillsDescription = `Install selected skills from ${aircurySkillsSource}`;

describe("getLocalFiles", () => {
  it("always includes the core framework files", () => {
    const files = getLocalFiles([]);
    const paths = files.map((file) => file.path);
    expect(paths).toContain("FRAMEWORK.md");
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".aircury/framework.config.json");
    expect(paths).toContain("specs/features/README.md");
    expect(paths).toContain("FRAMEWORK.local.md");
  });

  it("installs FRAMEWORK.local.md as an editable local companion", () => {
    const files = getLocalFiles([]);
    const local = getFileByPath(files, "FRAMEWORK.local.md");

    expect(local.description).toBe("Project-specific framework instructions");
    expect(local.content).toContain("Project-specific instructions");
    expect(local.content).toContain("never overwrites it during updates");
    expect(local.content).not.toContain(FRAMEWORK_MAINTAINED_NOTICE);
  });

  it("adds maintained-file warnings to strict framework files", () => {
    const files = getLocalFiles([], ["testing"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    const config = getFileByPath(files, ".aircury/framework.config.json");
    const capability = getFileByPath(
      files,
      "docs/aircury/capabilities/testing.md",
    );

    expect(framework.content).toContain(FRAMEWORK_MAINTAINED_NOTICE);
    expect(JSON.parse(config.content)._notice).toBe(
      FRAMEWORK_MAINTAINED_NOTICE,
    );
    expect(capability.content).toContain(FRAMEWORK_MAINTAINED_NOTICE);
  });

  it("preserves an existing FRAMEWORK.local.md during install writes", () => {
    const dir = `${tmpdir()}/sdd-framework-local-${Date.now()}`;
    const localPath = join(dir, "FRAMEWORK.local.md");
    const localContent = "# Local framework rules\n\nKeep this.";

    mkdirSync(dir, { recursive: true });
    writeFileSync(localPath, localContent, "utf-8");

    for (const file of getLocalFiles([])) {
      writeFile(file, dir, false);
    }

    expect(readFileSync(localPath, "utf-8")).toBe(localContent);

    rmSync(dir, { recursive: true });
  });

  it("generates detailed capability docs for selected capabilities", () => {
    const files = getLocalFiles(
      [],
      [
        "testing",
        "ddd-hexagonal",
        "clean-architecture",
        "layered-architecture",
      ],
    );
    const paths = files.map((file) => file.path);
    expect(paths).toContain("docs/aircury/capabilities/testing.md");
    expect(paths).not.toContain("docs/aircury/capabilities/ddd-hexagonal.md");
    expect(paths).not.toContain(
      "docs/aircury/capabilities/clean-architecture.md",
    );
    expect(paths).toContain(
      "docs/aircury/capabilities/layered-architecture.md",
    );
    expect(
      getFileByPath(files, "docs/aircury/capabilities/testing.md").content,
    ).toContain("## TDD Workflow");
    expect(
      getFileByPath(files, "docs/aircury/capabilities/layered-architecture.md")
        .content,
    ).toContain("## Layered Architecture Rules");
  });

  it("includes CLAUDE.md when Claude Code is selected", () => {
    const files = getLocalFiles(["claude-code"]);
    expect(files.map((file) => file.path)).toContain("CLAUDE.md");
  });

  it("includes GEMINI.md when Gemini CLI is selected", () => {
    const files = getLocalFiles(["gemini-cli"]);
    expect(files.map((file) => file.path)).toContain("GEMINI.md");
  });

  it("does not include .cursorrules", () => {
    const files = getLocalFiles([]);

    expect(files.map((file) => file.path)).not.toContain(".cursorrules");
  });

  it("persists selected capabilities in the config file", () => {
    const files = getLocalFiles([], ["decision-records", "testing"]);
    const config = getFileByPath(files, ".aircury/framework.config.json");
    expect(config.content).toContain('"capabilities": [');
    expect(config.content).toContain(FRAMEWORK_MAINTAINED_NOTICE);
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
    const decisions = getFileByPath(
      files,
      "docs/aircury/capabilities/decision-records.md",
    );
    expect(framework.content).toContain(
      "docs/aircury/capabilities/decision-records.md",
    );
    expect(framework.content).not.toContain("## Architecture Decision Records");
    expect(decisions.content).toContain("## Architecture Decision Records");
    expect(decisions.content).toContain(
      "ADRs are mutable only while their status is `Draft`.",
    );
    expect(decisions.content).toContain(
      "An ADR leaves `Draft` only when the user explicitly confirms that the functionality or change is complete and that the ADR should no longer be a draft.",
    );
    expect(decisions.content).toContain(
      "After every modification to a draft ADR, ask the user whether they want to publish it now.",
    );
    expect(decisions.content).toContain(
      "`Supersedes: ADR-XXXX` or `Amends: ADR-XXXX`",
    );
    expect(decisions.content).toContain(
      "update the prior non-draft ADR only to mark that it was changed and where the new decision lives",
    );
    expect(decisions.content).toContain(
      "Use `Supersedes: ADR-XXXX` when the new decision completely replaces or invalidates the old one.",
    );
    expect(decisions.content).toContain(
      "Use `Amends: ADR-XXXX` when the new decision modifies, clarifies, or adds to the old one without completely invalidating it.",
    );
    expect(decisions.content).toContain(
      "- Superseded by: ADR-YYYY (only when updating a prior ADR marker)",
    );
    expect(framework.content).not.toContain("## TDD Workflow");
    expect(framework.content).not.toContain(
      "## Non-Negotiable Architecture Rules",
    );
  });

  it("always includes core engineering non-negotiables", () => {
    const files = getLocalFiles([], []);
    const framework = getFileByPath(files, "FRAMEWORK.md");

    expect(framework.content).toContain("## Engineering Non-Negotiables");
    expect(framework.content).toContain(
      "TDD is the default implementation discipline",
    );
    expect(framework.content).toContain(
      "SOLID principles are mandatory design constraints",
    );
    expect(framework.content).toContain("Clean Code is mandatory");
    expect(framework.content).toContain(
      "Architecture boundaries must remain explicit",
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

  it("uses the non-architecture capability profile by default", () => {
    const files = getLocalFiles([]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain("docs/aircury/capabilities/testing.md");
    expect(framework.content).not.toContain(
      "docs/aircury/capabilities/ddd-hexagonal.md",
    );
    expect(framework.content).not.toContain(
      "docs/aircury/capabilities/clean-architecture.md",
    );
    expect(framework.content).not.toContain(
      "docs/aircury/capabilities/layered-architecture.md",
    );
    expect(framework.content).toContain(
      "docs/aircury/capabilities/decision-records.md",
    );
    expect(framework.content).toContain(
      "docs/aircury/capabilities/token-efficiency.md",
    );
    expect(framework.content).toContain("## Engineering Non-Negotiables");
    expect(framework.content).not.toContain("## TDD Workflow");
    expect(framework.content).not.toContain(
      "## Non-Negotiable Architecture Rules",
    );
  });

  it("adds capability-owned files when selected", () => {
    const files = getLocalFiles([], ["frontend", "decision-records"]);
    const paths = files.map((file) => file.path);
    expect(paths).toContain("docs/aircury/capabilities/frontend.md");
    expect(paths).toContain("docs/aircury/capabilities/decision-records.md");
    expect(paths).toContain("specs/ui/README.md");
    expect(paths).toContain("specs/decisions/README.md");
  });

  it("requires searching the existing design system in the frontend workflow", () => {
    const files = getLocalFiles([], ["frontend"]);
    const workflow = getFileByPath(files, "specs/ui/frontend-workflow.md");
    expect(workflow.content).toContain(
      "Use `frontend-ui-workflow` to generate or update `specs/ui/style-guide.md`",
    );
  });

  it("adds frontend-specific check to FRAMEWORK.md when enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const framework = getFileByPath(files, "FRAMEWORK.md");
    expect(framework.content).toContain(
      "Visual modifications align with the project design system tokens",
    );
    expect(framework?.content).toContain(
      "extracted from the existing frontend through `frontend-ui-workflow`",
    );
  });

  it("includes frontend workflow guidance in FRAMEWORK.md when frontend is enabled", () => {
    const files = getLocalFiles([], ["frontend"]);
    const frontend = getFileByPath(
      files,
      "docs/aircury/capabilities/frontend.md",
    );
    expect(frontend.content).toContain("frontend-ui-workflow");
    expect(frontend.content).toContain("implementation-plan.md");
  });

  it("includes terse-response guidance in the token-efficiency capability doc", () => {
    const files = getLocalFiles([], ["token-efficiency"]);
    const tokenEfficiency = getFileByPath(
      files,
      "docs/aircury/capabilities/token-efficiency.md",
    );
    expect(tokenEfficiency.content).toContain(
      "Load and apply the `caveman` skill in `full` mode",
    );
    expect(tokenEfficiency.content).toContain("ACTIVE EVERY RESPONSE");
    expect(tokenEfficiency.content).toContain("stop caveman");
  });
});

describe("getGlobalFiles", () => {
  it("does not install any global files", () => {
    expect(getGlobalFiles(["claude-code"])).toHaveLength(0);
  });
});

describe("getLocalCommands", () => {
  it("installs the skills derived from the default capabilities for universal", () => {
    const commands = getLocalCommands([], getInitialCapabilityIds("local"));

    expect(commands).toHaveLength(6);
    const aircury = getCommandBySource(commands, aircurySkillsSource);
    expect(aircury.args).toContain("open-spec-propose");
    expect(aircury.args).toContain("spec-kit-specify");
    expect(aircury.args).toContain("airsync");
    expect(aircury.args).toContain("commit-changes");
    expect(aircury.args).toContain("frontend-ui-workflow");
    expect(aircury.args).toContain("specs-extractor");
    expect(aircury.args).toContain("dbml-database-docs");
    expect(
      getCommandBySource(
        commands,
        "https://github.com/aj-geddes/useful-ai-prompts",
      ).args,
    ).toContain("logging-best-practices");
    expect(
      commands.some((command) =>
        command.args.includes("https://github.com/ccheney/robust-skills"),
      ),
    ).toBe(false);
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
    expect(
      getCommandBySource(
        commands,
        "https://github.com/vercel-labs/agent-skills",
      ).args,
    ).toContain("vercel-react-best-practices");
  });

  it("installs local skills through universal and non-Claude tool agents", () => {
    const commands = getLocalCommands(["claude-code", "gemini-cli"], ["git"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toEqual([
      "-y",
      "skills",
      "add",
      aircurySkillsSource,
      "--skill",
      "commit-changes",
      "-a",
      "universal",
      "-a",
      "gemini-cli",
      "-y",
    ]);
  });

  it("does not ask skills add to install local Claude Code skills directly", () => {
    const commands = getLocalCommands(["claude-code"], ["git"]);

    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("universal");
    expect(commands[0].args).not.toContain("claude-code");
  });

  it("installs the external UK business English skill", () => {
    const commands = getLocalCommands([], ["language"]);
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

  it("installs the DDD+Hexagonal skill only for DDD+Hexagonal", () => {
    const hexagonalCommands = getLocalCommands([], ["ddd-hexagonal"]);
    expect(
      getCommandBySource(
        hexagonalCommands,
        "https://github.com/ccheney/robust-skills",
      ).args,
    ).toContain("clean-ddd-hexagonal");

    const cleanCommands = getLocalCommands([], ["clean-architecture"]);
    expect(
      cleanCommands.some((command) =>
        command.args.includes("https://github.com/ccheney/robust-skills"),
      ),
    ).toBe(false);

    const layeredCommands = getLocalCommands([], ["layered-architecture"]);
    expect(
      layeredCommands.some((command) =>
        command.args.includes("https://github.com/ccheney/robust-skills"),
      ),
    ).toBe(false);
  });

  it("installs the custom architecture skill only for Custom Architecture", () => {
    const customCommands = getLocalCommands([], ["custom-architecture"]);
    expect(
      getCommandBySource(customCommands, aircurySkillsSource).args,
    ).toContain("custom-architecture");

    const cleanCommands = getLocalCommands([], ["clean-architecture"]);
    expect(
      cleanCommands.some((command) =>
        command.args.includes("custom-architecture"),
      ),
    ).toBe(false);
  });

  it("does not install the hexagonal skill from defaults", () => {
    const commands = getLocalCommands([], getInitialCapabilityIds("local"));

    expect(
      commands.some((command) =>
        command.args.includes("https://github.com/ccheney/robust-skills"),
      ),
    ).toBe(false);
  });

  it("installs capability-required skills without a separate skill selection", () => {
    const commands = getLocalCommands([], ["frontend", "token-efficiency"]);

    expect(commands).toHaveLength(3);
    expect(commands[0].args).toContain("frontend-ui-workflow");
    expect(commands[1].args).toContain("caveman");
    expect(
      getCommandBySource(
        commands,
        "https://github.com/vercel-labs/agent-skills",
      ).args,
    ).toContain("vercel-react-best-practices");
  });

  it("installs the specs skills from the Aircury source", () => {
    const commands = getLocalCommands([], ["specs"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("specs-extractor");
    expect(commands[0].args).toContain("specs-interpreter");
    expect(commands[0].args).toContain("semantic-line-breaks");
    expect(commands[0].args).toContain("dbml-database-docs");
  });

  it("installs both database skills when the database capability is selected", () => {
    const commands = getLocalCommands([], ["database"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("blind-db-debugging");
    expect(commands[0].args).toContain("db-schema-design");
  });

  it("installs the frontend skills from the Aircury source", () => {
    const commands = getLocalCommands([], ["frontend"]);
    expect(commands).toHaveLength(2);
    expect(getCommandBySource(commands, aircurySkillsSource)).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        aircurySkillsSource,
        "--skill",
        "frontend-ui-workflow",
        "-a",
        "universal",
        "-y",
      ],
      description: aircurySkillsDescription,
    });
    expect(
      getCommandBySource(
        commands,
        "https://github.com/vercel-labs/agent-skills",
      ),
    ).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/vercel-labs/agent-skills",
        "--skill",
        "vercel-react-best-practices",
        "-a",
        "universal",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/vercel-labs/agent-skills",
    });
  });
});

describe("getGlobalCommands", () => {
  it("installs global skills for universal from selected capabilities", () => {
    const commands = getGlobalCommands([], ["git"]);
    expect(commands).toHaveLength(1);
    expect(getCommandBySource(commands, aircurySkillsSource).args).toContain(
      "-g",
    );
    expect(getCommandBySource(commands, aircurySkillsSource).args).toContain(
      "commit-changes",
    );
  });

  it("creates a global skills install command for selected agents", () => {
    const commands = getGlobalCommands(["claude-code"], ["git"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("-a");
    expect(commands[0].args).toContain("universal");
    expect(commands[0].args).toContain("claude-code");
    expect(commands[0].args).toContain("-g");
  });
});

describe("runCommand", () => {
  it("reports spawn errors when the command cannot be found", () => {
    const result = runCommand(
      {
        command: "aircury-missing-command",
        args: ["--version"],
        description: "missing command",
      },
      import.meta.dir,
    );

    expect(result.success).toBe(false);
    expect(result.stderr).toContain("aircury-missing-command");
  });

  it("installs the frontend skills globally from the Aircury source", () => {
    const commands = getGlobalCommands([], ["frontend"]);
    expect(commands).toHaveLength(2);
    expect(getCommandBySource(commands, aircurySkillsSource)).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        aircurySkillsSource,
        "--skill",
        "frontend-ui-workflow",
        "-a",
        "universal",
        "-g",
        "-y",
      ],
      description: aircurySkillsDescription,
    });
    expect(
      getCommandBySource(
        commands,
        "https://github.com/vercel-labs/agent-skills",
      ),
    ).toEqual({
      command: "npx",
      args: [
        "-y",
        "skills",
        "add",
        "https://github.com/vercel-labs/agent-skills",
        "--skill",
        "vercel-react-best-practices",
        "-a",
        "universal",
        "-g",
        "-y",
      ],
      description:
        "Install selected skills from https://github.com/vercel-labs/agent-skills",
    });
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

  it("merges the framework reference into an existing local CLAUDE.md", () => {
    const dir = `${tmpdir()}/sdd-claude-merge-${Date.now()}`;
    const file = getFileByPath(getLocalFiles(["claude-code"]), "CLAUDE.md");

    writeFile(
      {
        path: "CLAUDE.md",
        content: "# Existing Claude\n\nProject-specific Claude instructions.",
        description: "",
      },
      dir,
      false,
    );
    writeFile(file, dir, false);

    const content = readFileSync(join(dir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("Project-specific Claude instructions.");
    expect(content).toContain(
      "This project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).",
    );

    rmSync(dir, { recursive: true });
  });
});

describe("isMergeableFrameworkEntrypoint", () => {
  it("marks AGENTS.md and CLAUDE.md as mergeable", () => {
    expect(isMergeableFrameworkEntrypoint("AGENTS.md")).toBe(true);
    expect(isMergeableFrameworkEntrypoint("CLAUDE.md")).toBe(true);
    expect(isMergeableFrameworkEntrypoint("GEMINI.md")).toBe(false);
  });
});

describe("isProtectedLocalCompanion", () => {
  it("marks FRAMEWORK.local.md as protected", () => {
    expect(isProtectedLocalCompanion("FRAMEWORK.local.md")).toBe(true);
    expect(isProtectedLocalCompanion("FRAMEWORK.md")).toBe(false);
  });
});

describe("syncClaudeCodeSkills", () => {
  it("copies selected skills from .agents/skills to .claude/skills", () => {
    const dir = `${tmpdir()}/sdd-claude-skills-${Date.now()}`;
    const skillDir = join(dir, ".agents", "skills", "commit-changes");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "# Commit Changes", "utf-8");

    const result = syncClaudeCodeSkills(dir, [
      {
        source: "aircury/ai-framework",
        skillName: "commit-changes",
        scopes: ["local"],
      },
    ]);

    expect(result).toEqual({ copied: ["commit-changes"], missing: [] });
    expect(
      readFileSync(
        join(dir, ".claude", "skills", "commit-changes", "SKILL.md"),
        "utf-8",
      ),
    ).toBe("# Commit Changes");

    rmSync(dir, { recursive: true });
  });

  it("reports selected skills missing from .agents/skills", () => {
    const dir = `${tmpdir()}/sdd-claude-skills-missing-${Date.now()}`;

    const result = syncClaudeCodeSkills(dir, [
      {
        source: "unknown/source",
        skillName: "missing-skill",
        scopes: ["local"],
      },
    ]);

    expect(result).toEqual({ copied: [], missing: ["missing-skill"] });
    expect(existsSync(join(dir, ".claude", "skills"))).toBe(true);

    rmSync(dir, { recursive: true });
  });

  it("falls back to the Aircury source for selected local skills", () => {
    const dir = `${tmpdir()}/sdd-claude-aircury-skill-${Date.now()}`;
    const skills = getCapabilitySkills(["frontend"], "local").filter(
      (skill) => skill.skillName === "frontend-ui-workflow",
    );

    const result = syncClaudeCodeSkills(dir, skills);

    expect(result).toEqual({ copied: ["frontend-ui-workflow"], missing: [] });
    expect(
      readFileSync(
        join(dir, ".agents", "skills", "frontend-ui-workflow", "SKILL.md"),
        "utf-8",
      ),
    ).toContain("name: frontend-ui-workflow");
    expect(
      readFileSync(
        join(dir, ".claude", "skills", "frontend-ui-workflow", "SKILL.md"),
        "utf-8",
      ),
    ).toContain("name: frontend-ui-workflow");

    rmSync(dir, { recursive: true });
  });

  it("skips copying when the source and Claude target are the same directory", () => {
    const dir = `${tmpdir()}/sdd-claude-same-skill-${Date.now()}`;
    const sourceRoot = join(dir, ".agents", "skills");
    const targetDir = join(dir, ".claude", "skills", "caveman");
    mkdirSync(sourceRoot, { recursive: true });
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, "SKILL.md"), "# Caveman", "utf-8");
    symlinkSync(targetDir, join(sourceRoot, "caveman"), "dir");

    const result = syncClaudeCodeSkills(dir, [
      {
        source: "https://github.com/juliusbrussee/caveman",
        skillName: "caveman",
        scopes: ["local"],
      },
    ]);

    expect(result).toEqual({ copied: ["caveman"], missing: [] });
    expect(readFileSync(join(targetDir, "SKILL.md"), "utf-8")).toBe(
      "# Caveman",
    );

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
    expect(merged).toContain("FRAMEWORK.md");
  });

  it("does not duplicate the framework reference when already present", () => {
    const existing = `# Existing\n\nProject-specific instructions.\n\n${frameworkReference}`;
    const merged = mergeFrameworkReferenceIntoAgents(
      existing,
      frameworkReference,
    );

    expect(merged).toBe(existing.endsWith("\n") ? existing : `${existing}\n`);
  });

  it("adds the managed-section warning to an existing framework section", () => {
    const existing =
      "# AGENTS.md\n\n## Framework\n\nThis project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).\n";
    const merged = mergeFrameworkReferenceIntoAgents(
      existing,
      frameworkReference,
    );

    expect(merged).toContain(
      "Framework-managed section. Add project-specific instructions outside this section.",
    );
    expect(merged).toContain(
      "This project follows the Aircury engineering framework",
    );
  });
});
