import { describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FRAMEWORK_MAINTAINED_NOTICE,
  getInitialCapabilityIds,
} from "../src/capabilities";
import {
  applyFileWrites,
  checkConflicts,
  getAircurySkillsSource,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  getSkillsRunner,
  type InstallFile,
  isMergeableFrameworkEntrypoint,
  isProtectedLocalCompanion,
  mergeFrameworkReferenceIntoAgents,
  planFileWrites,
  planLocalSkills,
  readProjectProfile,
  runCommand,
  SKILLS_CLI,
  writeFile,
} from "../src/install";

const FEATURE_FOLDER_DESIGN_DOCUMENT =
  /specs\/features\/<[a-z-]+>\/(layout|experience|implementation-plan)\.md/;

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
const skillsRunner = getSkillsRunner();

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

  it("generates language-agnostic code style guidance", () => {
    const codeStyle = getFileByPath(
      getLocalFiles([], ["code-style"]),
      "docs/aircury/capabilities/code-style.md",
    ).content;
    expect(codeStyle).not.toContain("Analyse `package.json` to identify");
    expect(codeStyle).not.toContain("by analysing package.json");
    for (const manifest of [
      "package.json",
      "composer.json",
      "pyproject.toml",
      "go.mod",
      "Cargo.toml",
      ".editorconfig",
    ]) {
      expect(codeStyle).toContain(manifest);
    }
    expect(codeStyle).toContain("in each sub-project, not only the root");
    expect(codeStyle).toContain("Makefile");
    expect(codeStyle).toContain("CI");
    expect(codeStyle).toContain("Never introduce a new tool");
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

  it("persists selected tools in the config file", () => {
    const files = getLocalFiles(["claude-code"], ["git"]);
    const config = getFileByPath(files, ".aircury/framework.config.json");

    expect(JSON.parse(config.content).tools).toEqual(["claude-code"]);
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
      "Keep one ADR for each decision and revise it when the decision evolves.",
    );
    expect(decisions.content).toContain(
      "[Use Redis-backed sessions](specs/decisions/use-redis-backed-sessions.md)",
    );
    expect(decisions.content).not.toContain("Status:");
    expect(decisions.content).not.toContain("Supersedes:");
    expect(decisions.content).not.toContain("Amends:");
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

  it("generates Walking Skeleton capability guidance when selected", () => {
    const files = getLocalFiles([], ["walking-skeleton"]);
    const paths = files.map((file) => file.path);
    const walkingSkeleton = getFileByPath(
      files,
      "docs/aircury/capabilities/walking-skeleton.md",
    );

    expect(paths).toContain("docs/aircury/capabilities/walking-skeleton.md");
    expect(walkingSkeleton.content).toContain(
      "The walking-skeleton implementation lives outside this framework",
    );
    expect(walkingSkeleton.content).toContain("/walking-skeleton plan");
    expect(walkingSkeleton.content).toContain(
      "selected ADRs are copied into `specs/decisions/` with descriptive names",
    );
    expect(walkingSkeleton.content).not.toContain("ADR-0000");
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

  it("keeps front-end design documents with the change, not the feature", () => {
    const files = getLocalFiles([], ["frontend"]);
    for (const path of [
      "specs/ui/README.md",
      "specs/ui/frontend-workflow.md",
      "specs/features/README.md",
      "docs/aircury/capabilities/frontend.md",
    ]) {
      const file = getFileByPath(files, path);
      expect(file.content).toContain("specs/changes/<name>/");
      expect(file.content).toContain("the only feature-level document");
      expect(file.content).not.toMatch(FEATURE_FOLDER_DESIGN_DOCUMENT);
    }
    expect(getFileByPath(files, "specs/features/README.md").content).toContain(
      "stay as history",
    );
    const frontendRules = getFileByPath(
      files,
      "docs/aircury/capabilities/frontend.md",
    ).content;
    expect(frontendRules).toContain(
      "decisions that must outlive the change in `specs/decisions/`",
    );
    expect(frontendRules).toContain("stay as history");
  });

  it("ships a frontend workflow skill that writes the design documents with the change", () => {
    const skillDir = join(
      import.meta.dir,
      "..",
      "skills",
      "frontend-ui-workflow",
    );
    for (const file of [
      "SKILL.md",
      "references/layout-extraction.md",
      "references/experience-extraction.md",
      "references/clean-implementation.md",
      "references/ui-generation.md",
    ]) {
      const text = readFileSync(join(skillDir, file), "utf8");
      expect(text).not.toMatch(FEATURE_FOLDER_DESIGN_DOCUMENT);
    }
    expect(readFileSync(join(skillDir, "SKILL.md"), "utf8")).toContain(
      "specs/changes/<name>/layout.md",
    );
    expect(readFileSync(join(skillDir, "SKILL.md"), "utf8")).toContain(
      "decisions that must outlive the change in `specs/decisions/`",
    );
    expect(readFileSync(join(skillDir, "SKILL.md"), "utf8")).toContain(
      "stay as history",
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
});

describe("getGlobalFiles", () => {
  it("does not install any global files", () => {
    expect(getGlobalFiles(["claude-code"])).toHaveLength(0);
  });
});

describe("readProjectProfile", () => {
  it("reads a valid saved project profile", () => {
    const dir = `${tmpdir()}/ai-framework-profile-${Date.now()}`;
    const profileDir = join(dir, ".aircury");
    mkdirSync(profileDir, { recursive: true });
    writeFileSync(
      join(profileDir, "framework.config.json"),
      JSON.stringify({
        version: 2,
        _notice: FRAMEWORK_MAINTAINED_NOTICE,
        tools: ["claude-code"],
        capabilities: ["git", "frontend"],
        language: { britishEnglish: true },
      }),
      "utf-8",
    );

    expect(readProjectProfile(dir)).toEqual({
      version: 2,
      _notice: FRAMEWORK_MAINTAINED_NOTICE,
      tools: ["claude-code"],
      capabilities: ["git", "frontend"],
      language: { britishEnglish: true },
    });

    rmSync(dir, { recursive: true });
  });

  it("accepts a legacy profile without saved tools", () => {
    const dir = `${tmpdir()}/ai-framework-legacy-profile-${Date.now()}`;
    const profileDir = join(dir, ".aircury");
    mkdirSync(profileDir, { recursive: true });
    writeFileSync(
      join(profileDir, "framework.config.json"),
      JSON.stringify({
        version: 2,
        _notice: FRAMEWORK_MAINTAINED_NOTICE,
        capabilities: ["git"],
        language: { britishEnglish: false },
      }),
      "utf-8",
    );

    expect(readProjectProfile(dir)?.tools).toBeUndefined();

    rmSync(dir, { recursive: true });
  });

  it("ignores an invalid saved project profile", () => {
    const dir = `${tmpdir()}/ai-framework-invalid-profile-${Date.now()}`;
    const profileDir = join(dir, ".aircury");
    mkdirSync(profileDir, { recursive: true });
    writeFileSync(
      join(profileDir, "framework.config.json"),
      JSON.stringify({ version: 2, capabilities: ["git"] }),
      "utf-8",
    );

    expect(readProjectProfile(dir)).toBeNull();

    rmSync(dir, { recursive: true });
  });
});

describe("getLocalCommands", () => {
  it("installs the skills derived from the default capabilities for universal", () => {
    const commands = getLocalCommands([], getInitialCapabilityIds("local"));

    expect(commands).toHaveLength(5);
    const aircury = getCommandBySource(commands, aircurySkillsSource);
    expect(aircury.args).toContain("spec-kit-specify");
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

  it("installs local skills through universal and selected tool agents", () => {
    const commands = getLocalCommands(["claude-code", "gemini-cli"], ["git"]);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toEqual([
      "-y",
      SKILLS_CLI,
      "add",
      aircurySkillsSource,
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

  it("asks skills add to link local Claude Code skills", () => {
    const commands = getLocalCommands(["claude-code"], ["git"]);

    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain("universal");
    expect(commands[0].args).toContain("claude-code");
    expect(commands[0].args).not.toContain("--copy");
  });

  it("installs the external UK business English skill", () => {
    const commands = getLocalCommands([], ["language"]);
    expect(
      getCommandBySource(commands, "https://github.com/jezweb/claude-skills")
        .args,
    ).toContain("uk-business-english");
  });

  it("installs the external Walking Skeleton skill", () => {
    const commands = getLocalCommands([], ["walking-skeleton"]);

    expect(commands).toHaveLength(1);
    expect(getCommandBySource(commands, "aircury/walking-skeleton")).toEqual({
      command: skillsRunner,
      args: [
        "-y",
        SKILLS_CLI,
        "add",
        "aircury/walking-skeleton",
        "--skill",
        "walking-skeleton",
        "-a",
        "universal",
        "-y",
      ],
      description: "Install selected skills from aircury/walking-skeleton",
    });
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
    expect(commands[0].args).toContain("supervised-db-debugging");
  });

  it("installs the frontend skills from the Aircury source", () => {
    const commands = getLocalCommands([], ["frontend"]);
    expect(commands).toHaveLength(2);
    expect(getCommandBySource(commands, aircurySkillsSource)).toEqual({
      command: skillsRunner,
      args: [
        "-y",
        SKILLS_CLI,
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
      command: skillsRunner,
      args: [
        "-y",
        SKILLS_CLI,
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
      command: skillsRunner,
      args: [
        "-y",
        SKILLS_CLI,
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
      command: skillsRunner,
      args: [
        "-y",
        SKILLS_CLI,
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

describe("planLocalSkills", () => {
  const capabilities = getInitialCapabilityIds("local");

  function makeProject(name: string): string {
    const dir = `${tmpdir()}/ai-framework-skills-${name}-${Date.now()}`;
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  function addSkill(dir: string, skillName: string): void {
    mkdirSync(join(dir, ".agents", "skills", skillName), { recursive: true });
    writeFileSync(
      join(dir, ".agents", "skills", skillName, "SKILL.md"),
      `---\nname: ${skillName}\n---\n`,
    );
  }

  it("installs the skills as usual when the project has no skills submodule", () => {
    const dir = makeProject("plain");
    try {
      const plan = planLocalSkills(["claude-code"], capabilities, dir);
      expect(plan.submodule).toBeNull();
      expect(plan.commands).toEqual(
        getLocalCommands(["claude-code"], capabilities),
      );
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it("installs nothing into .agents/skills when it is a git submodule, and says which skills it lacks", () => {
    const dir = makeProject("submodule");
    try {
      writeFileSync(
        join(dir, ".gitmodules"),
        '[submodule ".agents/skills"]\n\tpath = .agents/skills\n\turl = git@github.com:example/skills.git\n',
      );
      addSkill(dir, "commit-changes");
      addSkill(dir, "spec-kit-specify");
      addSkill(dir, "unrelated-skill");

      const plan = planLocalSkills(["claude-code"], capabilities, dir);

      expect(plan.commands).toEqual([]);
      expect(plan.submodule?.path).toBe(".agents/skills");
      expect(plan.submodule?.provided).toEqual([
        "commit-changes",
        "spec-kit-specify",
      ]);
      expect(plan.submodule?.missing).toContain("frontend-ui-workflow");
      expect(plan.submodule?.missing).not.toContain("commit-changes");
      expect(plan.submodule?.missing).not.toContain("unrelated-skill");
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it("ignores a submodule at another path", () => {
    const dir = makeProject("other-submodule");
    try {
      writeFileSync(
        join(dir, ".gitmodules"),
        '[submodule "vendor/lib"]\n\tpath = vendor/lib\n\turl = git@github.com:example/lib.git\n',
      );
      const plan = planLocalSkills(["claude-code"], capabilities, dir);
      expect(plan.submodule).toBeNull();
      expect(plan.commands.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

describe("commit-changes skill", () => {
  const skill = readFileSync(
    join(import.meta.dir, "..", "skills", "commit-changes", "SKILL.md"),
    "utf8",
  );

  it("allows a body when the subject cannot carry the context", () => {
    expect(skill).not.toContain("never use a commit body");
    expect(skill).toContain("Add a body when the change needs");
  });

  it("follows the project's own commit convention on top of the format", () => {
    expect(skill).toContain(
      "The project's own convention comes on top of this format.",
    );
  });
});

describe("module rules", () => {
  const LOCAL_SOURCE_OF_TRUTH =
    /(structural|behavioral|behavioural|clean implementation)( and UX)? source of truth/;

  it("lets contexts meet only through a shared contract or an event", () => {
    const ddd = getFileByPath(
      getLocalFiles([], ["ddd-hexagonal"]),
      "docs/aircury/capabilities/ddd-hexagonal.md",
    ).content;
    expect(ddd).toContain("never by importing each other");
    expect(ddd).not.toContain("explicit application services or domain events");
    const plan = readFileSync(
      join(import.meta.dir, "..", "skills", "spec-kit-plan", "SKILL.md"),
      "utf8",
    );
    expect(plan).not.toContain("domain events or application services only");
  });

  it("allows one deliberate answer for not allowed and not there, with its reason", () => {
    const resilience = getFileByPath(
      getLocalFiles([], ["resilience"]),
      "docs/aircury/capabilities/resilience.md",
    ).content;
    expect(resilience).toContain("would reveal that it exists");
  });

  it("keeps the feature spec as the source of truth the change's design documents feed", () => {
    const files = getLocalFiles([], ["frontend"]);
    for (const path of [
      "docs/aircury/capabilities/frontend.md",
      "specs/features/README.md",
      "specs/ui/frontend-workflow.md",
    ]) {
      expect(getFileByPath(files, path).content).not.toMatch(
        LOCAL_SOURCE_OF_TRUTH,
      );
    }
    const generation = readFileSync(
      join(
        import.meta.dir,
        "..",
        "skills",
        "frontend-ui-workflow",
        "references",
        "ui-generation.md",
      ),
      "utf8",
    );
    expect(generation).not.toMatch(LOCAL_SOURCE_OF_TRUTH);
    expect(generation).toContain(
      "the source of truth for structure and behaviour",
    );
  });
});

describe("unattended runs and port fakes", () => {
  it("lets an unattended run's launching instructions stand in for the user", () => {
    const framework = getFileByPath(getLocalFiles([]), "FRAMEWORK.md").content;
    expect(framework).toContain("### Unattended runs");
    expect(framework).toContain(
      "those instructions stand in for the user's answers",
    );
    expect(framework).toContain("`FRAMEWORK.md § Unattended runs`");
  });

  it("allows in-memory port fakes held to the real adapter by a shared contract test", () => {
    const testing = getFileByPath(
      getLocalFiles([], ["testing"]),
      "docs/aircury/capabilities/testing.md",
    ).content;
    expect(testing).not.toContain(
      "Write integration tests for application use cases",
    );
    expect(testing).toContain(
      "passes the same contract tests as the real adapter",
    );
  });
});

describe("updating an installed project", () => {
  const NOTICE = "This file is maintained by Aircury AI Framework.";

  function makeProject(name: string): string {
    const dir = `${tmpdir()}/ai-framework-update-${name}-${Date.now()}`;
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  function put(dir: string, path: string, content: string): void {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), content);
  }

  function actionFor(plan: ReturnType<typeof planFileWrites>, path: string) {
    return plan.find((entry) => entry.path === path)?.action;
  }

  it("refreshes framework-maintained files and keeps the project's own", () => {
    const dir = makeProject("ownership");
    try {
      const files = getLocalFiles(["claude-code"], ["frontend"]);
      put(dir, "FRAMEWORK.md", "# FRAMEWORK.md\n\nAn older version.\n");
      put(dir, "FRAMEWORK.local.md", "# Project rules\n");
      put(dir, "specs/features/README.md", "# Our own rules for specs\n");
      put(dir, "AGENTS.md", "# AGENTS.md\n\nProject notes.\n");
      const frontend = getFileByPath(
        files,
        "docs/aircury/capabilities/frontend.md",
      );
      put(dir, frontend.path, frontend.content);

      const plan = planFileWrites(files, dir);

      expect(actionFor(plan, "FRAMEWORK.md")).toBe("refresh");
      expect(actionFor(plan, "FRAMEWORK.local.md")).toBe("keep");
      expect(actionFor(plan, "specs/features/README.md")).toBe("keep");
      expect(actionFor(plan, "AGENTS.md")).toBe("merge");
      expect(actionFor(plan, frontend.path)).toBe("unchanged");
      expect(actionFor(plan, "specs/ui/README.md")).toBe("create");

      applyFileWrites(plan, dir);

      expect(readFileSync(join(dir, "FRAMEWORK.md"), "utf8")).toBe(
        getFileByPath(files, "FRAMEWORK.md").content,
      );
      expect(readFileSync(join(dir, "FRAMEWORK.local.md"), "utf8")).toBe(
        "# Project rules\n",
      );
      expect(readFileSync(join(dir, "specs/features/README.md"), "utf8")).toBe(
        "# Our own rules for specs\n",
      );
      expect(readFileSync(join(dir, "AGENTS.md"), "utf8")).toContain(
        "Project notes.",
      );
      expect(existsSync(join(dir, "specs/ui/README.md"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it("removes framework capability files the profile no longer installs", () => {
    const dir = makeProject("stale");
    try {
      const files = getLocalFiles([], ["frontend"]);
      put(
        dir,
        "docs/aircury/capabilities/airsync.md",
        `# Airsync\n\n> ${NOTICE} Do not edit it directly.\n`,
      );
      put(
        dir,
        "docs/aircury/capabilities/our-notes.md",
        "# Written by the project\n",
      );

      const plan = planFileWrites(files, dir);

      expect(actionFor(plan, "docs/aircury/capabilities/airsync.md")).toBe(
        "remove",
      );
      expect(
        actionFor(plan, "docs/aircury/capabilities/our-notes.md"),
      ).toBeUndefined();

      applyFileWrites(plan, dir);

      expect(
        existsSync(join(dir, "docs/aircury/capabilities/airsync.md")),
      ).toBe(false);
      expect(
        existsSync(join(dir, "docs/aircury/capabilities/our-notes.md")),
      ).toBe(true);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it("titles each agent entrypoint after its own file", () => {
    const files = getLocalFiles(["claude-code", "gemini-cli"], []);
    expect(getFileByPath(files, "AGENTS.md").content).toStartWith(
      "# AGENTS.md\n",
    );
    expect(getFileByPath(files, "CLAUDE.md").content).toStartWith(
      "# CLAUDE.md\n",
    );
    expect(getFileByPath(files, "GEMINI.md").content).toStartWith(
      "# GEMINI.md\n",
    );
  });

  it("records the framework version that wrote the profile", () => {
    const files = getLocalFiles([], [], { frameworkVersion: "9.8.7" });
    const profile = JSON.parse(
      getFileByPath(files, ".aircury/framework.config.json").content,
    );
    expect(profile.frameworkVersion).toBe("9.8.7");
  });
});

describe("skills submodule detection", () => {
  it("recognises a skills submodule declared by a parent repository", () => {
    const repo = `${tmpdir()}/ai-framework-monorepo-${Date.now()}`;
    const project = join(repo, "projects", "app");
    mkdirSync(project, { recursive: true });
    try {
      const git = (...args: string[]) =>
        Bun.spawnSync(["git", "-C", repo, ...args], { stderr: "pipe" });
      git("init", "-q");
      git(
        "update-index",
        "--add",
        "--cacheinfo",
        "160000,0123456789abcdef0123456789abcdef01234567,projects/app/.agents/skills",
      );

      const plan = planLocalSkills(
        ["claude-code"],
        getInitialCapabilityIds("local"),
        project,
      );

      expect(plan.commands).toEqual([]);
      expect(plan.submodule?.path).toBe(".agents/skills");
      expect(plan.submodule?.initialised).toBe(false);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe("skills CLI version", () => {
  it("runs the skills CLI at the version the skills devDependency pins", () => {
    const packageJson = JSON.parse(
      readFileSync(join(import.meta.dir, "..", "package.json"), "utf-8"),
    );
    expect(SKILLS_CLI).toBe(`skills@${packageJson.devDependencies.skills}`);
  });
});
