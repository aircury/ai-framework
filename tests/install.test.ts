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
  compareSkillVersions,
  getAircurySkillsSource,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  getLocalSkillOverrides,
  type InstallFile,
  isMergeableFrameworkEntrypoint,
  isProtectedLocalCompanion,
  mergeFrameworkReferenceIntoAgents,
  persistRuntimeSkillToLocalRules,
  readSkillVersion,
  restoreLocalSkillOverrides,
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
    expect(paths).toContain(".localRules/framework.local.md");
  });

  it("installs .localRules/framework.local.md as an editable local companion", () => {
    const files = getLocalFiles([]);
    const local = getFileByPath(files, ".localRules/framework.local.md");

    expect(local.description).toBe("Project-specific framework instructions");
    expect(local.content).toContain("Project-specific instructions");
    expect(local.content).toContain("versioned with the project");
    expect(local.content).toContain("never overwrites it during updates");
    expect(local.content).toContain(".localRules/skills/<skill-name>/");
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

  it("preserves an existing .localRules/framework.local.md during install writes", () => {
    const dir = `${tmpdir()}/sdd-framework-local-${Date.now()}`;
    const localPath = join(dir, ".localRules", "framework.local.md");
    const localContent = "# Local framework rules\n\nKeep this.";

    mkdirSync(join(dir, ".localRules"), { recursive: true });
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
    expect(commands[0].args).toContain("local-customization");
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

  it("preserves configured local skills when rewriting framework config", () => {
    const dir = `${tmpdir()}/sdd-config-local-skills-${Date.now()}`;
    const configPath = join(dir, ".aircury", "framework.config.json");
    mkdirSync(join(dir, ".aircury"), { recursive: true });
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 2,
          _notice: FRAMEWORK_MAINTAINED_NOTICE,
          capabilities: ["testing"],
          language: { britishEnglish: false },
          localSkills: [
            {
              name: "payments-refunds",
              kind: "local-skill",
              source: ".localRules/skills/payments-refunds",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf-8",
    );

    writeFile(
      getFileByPath(
        getLocalFiles([], ["frontend"]),
        ".aircury/framework.config.json",
      ),
      dir,
      false,
    );

    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(config.capabilities).toContain("frontend");
    expect(config.localSkills).toEqual([
      {
        name: "payments-refunds",
        kind: "local-skill",
        source: ".localRules/skills/payments-refunds",
      },
    ]);

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
  it("marks .localRules/framework.local.md as protected", () => {
    expect(isProtectedLocalCompanion(".localRules/framework.local.md")).toBe(
      true,
    );
    expect(isProtectedLocalCompanion("FRAMEWORK.local.md")).toBe(false);
    expect(isProtectedLocalCompanion("FRAMEWORK.md")).toBe(false);
  });
});

describe("skill versions", () => {
  it("reads metadata.version from skill frontmatter", () => {
    const dir = `${tmpdir()}/sdd-skill-version-${Date.now()}`;
    const skillPath = join(dir, "SKILL.md");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      skillPath,
      `---\nname: example\nmetadata:\n  author: Aircury\n  version: "1.2.3"\n---\n`,
      "utf-8",
    );

    expect(readSkillVersion(skillPath)).toBe("1.2.3");

    rmSync(dir, { recursive: true });
  });

  it("returns null when a skill version is missing", () => {
    const dir = `${tmpdir()}/sdd-skill-version-missing-${Date.now()}`;
    const skillPath = join(dir, "SKILL.md");
    mkdirSync(dir, { recursive: true });
    writeFileSync(skillPath, `---\nname: example\n---\n`, "utf-8");

    expect(readSkillVersion(skillPath)).toBeNull();

    rmSync(dir, { recursive: true });
  });

  it("compares equal numeric skill versions", () => {
    expect(compareSkillVersions("1.0", "1.0.0")).toBe("equal");
  });

  it("compares greater and lower numeric skill versions", () => {
    expect(compareSkillVersions("1.2.0", "1.1.9")).toBe("left-greater");
    expect(compareSkillVersions("1.0.0", "1.0.1")).toBe("right-greater");
  });

  it("treats missing and unparsable versions as unknown", () => {
    expect(compareSkillVersions(null, "1.0.0")).toBe("unknown");
    expect(compareSkillVersions("next", "1.0.0")).toBe("unknown");
  });
});

describe("getLocalSkillOverrides", () => {
  it("detects a selected skill override with SKILL.md", () => {
    const dir = `${tmpdir()}/sdd-local-skill-override-${Date.now()}`;
    const skillDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "# Local Commit", "utf-8");

    const overrides = getLocalSkillOverrides(dir, [
      {
        source: "aircury/ai-framework",
        skillName: "commit-changes",
        scopes: ["local"],
      },
    ]);

    expect(overrides).toEqual([
      {
        skill: {
          source: "aircury/ai-framework",
          skillName: "commit-changes",
          scopes: ["local"],
        },
        path: skillDir,
        skillPath: join(skillDir, "SKILL.md"),
      },
    ]);

    rmSync(dir, { recursive: true });
  });

  it("ignores selected skills without local overrides", () => {
    const dir = `${tmpdir()}/sdd-local-skill-override-missing-${Date.now()}`;
    mkdirSync(dir, { recursive: true });

    expect(
      getLocalSkillOverrides(dir, [
        {
          source: "aircury/ai-framework",
          skillName: "commit-changes",
          scopes: ["local"],
        },
      ]),
    ).toEqual([]);

    rmSync(dir, { recursive: true });
  });

  it("ignores override folders without SKILL.md", () => {
    const dir = `${tmpdir()}/sdd-local-skill-override-empty-${Date.now()}`;
    mkdirSync(join(dir, ".localRules", "skills", "commit-changes"), {
      recursive: true,
    });

    expect(
      getLocalSkillOverrides(dir, [
        {
          source: "aircury/ai-framework",
          skillName: "commit-changes",
          scopes: ["local"],
        },
      ]),
    ).toEqual([]);

    rmSync(dir, { recursive: true });
  });

  it("only detects overrides for selected skills", () => {
    const dir = `${tmpdir()}/sdd-local-skill-override-selected-${Date.now()}`;
    const skillDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "# Local Commit", "utf-8");

    expect(
      getLocalSkillOverrides(dir, [
        {
          source: "aircury/ai-framework",
          skillName: "frontend-ui-workflow",
          scopes: ["local"],
        },
      ]),
    ).toEqual([]);

    rmSync(dir, { recursive: true });
  });
});

describe("persistRuntimeSkillToLocalRules", () => {
  it("persists a runtime skill from .agents/skills", () => {
    const dir = `${tmpdir()}/sdd-persist-agent-skill-${Date.now()}`;
    const runtimeDir = join(dir, ".agents", "skills", "commit-changes");
    mkdirSync(join(runtimeDir, "references"), { recursive: true });
    writeFileSync(join(runtimeDir, "SKILL.md"), "# Runtime Commit", "utf-8");
    writeFileSync(join(runtimeDir, "references", "guide.md"), "Guide", "utf-8");

    const result = persistRuntimeSkillToLocalRules(dir, "commit-changes");

    expect(result.persisted).toBe(true);
    expect(result.source).toBe(runtimeDir);
    expect(
      readFileSync(
        join(dir, ".localRules", "skills", "commit-changes", "SKILL.md"),
        "utf-8",
      ),
    ).toBe("# Runtime Commit");
    expect(
      readFileSync(
        join(
          dir,
          ".localRules",
          "skills",
          "commit-changes",
          "references",
          "guide.md",
        ),
        "utf-8",
      ),
    ).toBe("Guide");

    rmSync(dir, { recursive: true });
  });

  it("falls back to .claude/skills when .agents is unavailable", () => {
    const dir = `${tmpdir()}/sdd-persist-claude-skill-${Date.now()}`;
    const runtimeDir = join(dir, ".claude", "skills", "commit-changes");
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(join(runtimeDir, "SKILL.md"), "# Claude Commit", "utf-8");

    const result = persistRuntimeSkillToLocalRules(dir, "commit-changes");

    expect(result.persisted).toBe(true);
    expect(result.source).toBe(runtimeDir);
    expect(
      readFileSync(
        join(dir, ".localRules", "skills", "commit-changes", "SKILL.md"),
        "utf-8",
      ),
    ).toBe("# Claude Commit");

    rmSync(dir, { recursive: true });
  });

  it("reports missing runtime skills without creating invalid shadows", () => {
    const dir = `${tmpdir()}/sdd-persist-missing-skill-${Date.now()}`;
    mkdirSync(dir, { recursive: true });

    const result = persistRuntimeSkillToLocalRules(dir, "missing-skill");

    expect(result.persisted).toBe(false);
    expect(result.source).toBeNull();
    expect(
      existsSync(join(dir, ".localRules", "skills", "missing-skill")),
    ).toBe(false);

    rmSync(dir, { recursive: true });
  });
});

describe("restoreLocalSkillOverrides", () => {
  const skill = {
    source: "aircury/ai-framework",
    skillName: "commit-changes",
    scopes: ["local" as const],
  };

  it("restores a local shadow when versions match", () => {
    const dir = `${tmpdir()}/sdd-restore-matching-skill-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0.0"\n---\n\n# Local`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result).toEqual({
      restored: ["commit-changes"],
      skipped: [],
      missing: [],
      warnings: [],
    });
    expect(readFileSync(join(officialDir, "SKILL.md"), "utf-8")).toContain(
      "# Local",
    );

    rmSync(dir, { recursive: true });
  });

  it("emits no warning when versions match", () => {
    const dir = `${tmpdir()}/sdd-restore-no-warning-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Local`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result.restored).toEqual(["commit-changes"]);
    expect(result.warnings).toEqual([]);

    rmSync(dir, { recursive: true });
  });

  it("keeps the official runtime skill when versions differ", () => {
    const dir = `${tmpdir()}/sdd-restore-newer-official-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.1"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Local`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result.restored).toEqual([]);
    expect(result.skipped).toEqual(["commit-changes"]);
    expect(result.warnings[0].message).toContain("Official version 1.1");
    expect(readFileSync(join(officialDir, "SKILL.md"), "utf-8")).toContain(
      "# Official",
    );

    rmSync(dir, { recursive: true });
  });

  it("warns and keeps the official runtime skill when local version is greater", () => {
    const dir = `${tmpdir()}/sdd-restore-local-greater-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.1"\n---\n\n# Local`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result.restored).toEqual([]);
    expect(result.skipped).toEqual(["commit-changes"]);
    expect(result.warnings[0].message).toContain(
      "Local shadow version 1.1 differs from official version 1.0",
    );
    expect(readFileSync(join(officialDir, "SKILL.md"), "utf-8")).toContain(
      "# Official",
    );

    rmSync(dir, { recursive: true });
  });

  it("warns and keeps official runtime skill when a version is unparsable", () => {
    const dir = `${tmpdir()}/sdd-restore-unparsable-version-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0-beta"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Local`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result.restored).toEqual([]);
    expect(result.skipped).toEqual(["commit-changes"]);
    expect(result.warnings[0].message).toContain(
      "Version comparison was unknown",
    );
    expect(result.warnings[0].officialVersion).toBe("1.0-beta");
    expect(readFileSync(join(officialDir, "SKILL.md"), "utf-8")).toContain(
      "# Official",
    );

    rmSync(dir, { recursive: true });
  });

  it("warns and keeps official runtime skill when versions are unknown", () => {
    const dir = `${tmpdir()}/sdd-restore-unknown-version-${Date.now()}`;
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(join(officialDir, "SKILL.md"), "# Official", "utf-8");
    writeFileSync(join(localDir, "SKILL.md"), "# Local", "utf-8");

    const result = restoreLocalSkillOverrides(dir, [skill]);

    expect(result.restored).toEqual([]);
    expect(result.skipped).toEqual(["commit-changes"]);
    expect(result.warnings[0].message).toContain("unknown");
    expect(readFileSync(join(officialDir, "SKILL.md"), "utf-8")).toBe(
      "# Official",
    );

    rmSync(dir, { recursive: true });
  });

  it("restores configured new local skills that are not selected capability skills", () => {
    const dir = `${tmpdir()}/sdd-restore-configured-local-skill-${Date.now()}`;
    const localDir = join(dir, ".localRules", "skills", "payments-refunds");
    mkdirSync(localDir, { recursive: true });
    mkdirSync(join(dir, ".aircury"), { recursive: true });
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Payments Refunds`,
      "utf-8",
    );
    writeFileSync(
      join(dir, ".aircury", "framework.config.json"),
      `${JSON.stringify(
        {
          version: 2,
          _notice: FRAMEWORK_MAINTAINED_NOTICE,
          capabilities: [],
          language: { britishEnglish: false },
          localSkills: [
            {
              name: "payments-refunds",
              kind: "local-skill",
              source: ".localRules/skills/payments-refunds",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, []);

    expect(result).toEqual({
      restored: ["payments-refunds"],
      skipped: [],
      missing: [],
      warnings: [],
    });
    expect(
      readFileSync(
        join(dir, ".agents", "skills", "payments-refunds", "SKILL.md"),
        "utf-8",
      ),
    ).toContain("# Payments Refunds");

    rmSync(dir, { recursive: true });
  });

  it("reports configured local skills missing from .localRules", () => {
    const dir = `${tmpdir()}/sdd-restore-missing-configured-local-skill-${Date.now()}`;
    mkdirSync(join(dir, ".aircury"), { recursive: true });
    writeFileSync(
      join(dir, ".aircury", "framework.config.json"),
      `${JSON.stringify(
        {
          version: 2,
          _notice: FRAMEWORK_MAINTAINED_NOTICE,
          capabilities: [],
          language: { britishEnglish: false },
          localSkills: [
            {
              name: "missing-local-skill",
              kind: "local-skill",
              source: ".localRules/skills/missing-local-skill",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf-8",
    );

    const result = restoreLocalSkillOverrides(dir, []);

    expect(result.restored).toEqual([]);
    expect(result.missing).toEqual(["missing-local-skill"]);

    rmSync(dir, { recursive: true });
  });
});

describe("syncClaudeCodeSkills", () => {
  it("syncs restored configured local skills into .claude/skills", () => {
    const dir = `${tmpdir()}/sdd-claude-configured-local-skill-${Date.now()}`;
    const localDir = join(dir, ".localRules", "skills", "payments-refunds");
    mkdirSync(localDir, { recursive: true });
    mkdirSync(join(dir, ".aircury"), { recursive: true });
    writeFileSync(join(localDir, "SKILL.md"), "# Payments Refunds", "utf-8");
    writeFileSync(
      join(dir, ".aircury", "framework.config.json"),
      `${JSON.stringify(
        {
          version: 2,
          _notice: FRAMEWORK_MAINTAINED_NOTICE,
          capabilities: [],
          language: { britishEnglish: false },
          localSkills: [
            {
              name: "payments-refunds",
              kind: "local-skill",
              source: ".localRules/skills/payments-refunds",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf-8",
    );

    const restoreResult = restoreLocalSkillOverrides(dir, []);
    const syncResult = syncClaudeCodeSkills(dir, [
      {
        source: "local",
        skillName: "payments-refunds",
        scopes: ["local"],
      },
    ]);

    expect(restoreResult.restored).toEqual(["payments-refunds"]);
    expect(syncResult).toEqual({ copied: ["payments-refunds"], missing: [] });
    expect(
      readFileSync(
        join(dir, ".claude", "skills", "payments-refunds", "SKILL.md"),
        "utf-8",
      ),
    ).toBe("# Payments Refunds");

    rmSync(dir, { recursive: true });
  });

  it("syncs restored local shadows into .claude/skills", () => {
    const dir = `${tmpdir()}/sdd-claude-restored-shadow-${Date.now()}`;
    const skill = {
      source: "aircury/ai-framework",
      skillName: "commit-changes",
      scopes: ["local" as const],
    };
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Local`,
      "utf-8",
    );

    restoreLocalSkillOverrides(dir, [skill]);
    const result = syncClaudeCodeSkills(dir, [skill]);

    expect(result).toEqual({ copied: ["commit-changes"], missing: [] });
    expect(
      readFileSync(
        join(dir, ".claude", "skills", "commit-changes", "SKILL.md"),
        "utf-8",
      ),
    ).toContain("# Local");

    rmSync(dir, { recursive: true });
  });

  it("syncs the official runtime skill to .claude/skills when versions differ", () => {
    const dir = `${tmpdir()}/sdd-claude-official-shadow-${Date.now()}`;
    const skill = {
      source: "aircury/ai-framework",
      skillName: "commit-changes",
      scopes: ["local" as const],
    };
    const officialDir = join(dir, ".agents", "skills", "commit-changes");
    const localDir = join(dir, ".localRules", "skills", "commit-changes");
    mkdirSync(officialDir, { recursive: true });
    mkdirSync(localDir, { recursive: true });
    writeFileSync(
      join(officialDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.1"\n---\n\n# Official`,
      "utf-8",
    );
    writeFileSync(
      join(localDir, "SKILL.md"),
      `---\nmetadata:\n  version: "1.0"\n---\n\n# Local`,
      "utf-8",
    );

    const restoreResult = restoreLocalSkillOverrides(dir, [skill]);
    const syncResult = syncClaudeCodeSkills(dir, [skill]);

    expect(restoreResult.restored).toEqual([]);
    expect(restoreResult.skipped).toEqual(["commit-changes"]);
    expect(syncResult).toEqual({ copied: ["commit-changes"], missing: [] });
    expect(
      readFileSync(
        join(dir, ".claude", "skills", "commit-changes", "SKILL.md"),
        "utf-8",
      ),
    ).toContain("# Official");

    rmSync(dir, { recursive: true });
  });

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
