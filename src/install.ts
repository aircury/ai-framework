import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { StandardModuleId, StandardModuleSelection } from "./framework";
import { createFrameworkProfile } from "./framework";
import { expandSkillGroups } from "./skills-catalog";
import { generateAgents, generateFramework } from "./templates";

export type Tool = "claude-code" | "gemini-cli" | "opencode";
export type Scope = "local" | "global";

export interface InstallFile {
  path: string;
  content: string;
  description: string;
}

export interface InstallCommand {
  command: string;
  args: string[];
  description: string;
}

export interface InstallOptions {
  britishEnglish?: boolean;
}

const FRAMEWORK_REFERENCE_SENTENCE =
  "This project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).";
const LEGACY_AIRCURY_AGENTS_SENTENCE =
  "All agents contributing to this repository MUST read and apply FRAMEWORK.md before doing any work. It is not optional and it is not advisory.";

function getSpecsFiles(moduleIds: StandardModuleId[]): InstallFile[] {
  const files: InstallFile[] = [
    {
      path: "specs/features/README.md",
      content: `# Living Specifications

\`specs/features/\` stores the canonical, technology-agnostic description of observable system behavior.

- Create one folder per capability.
- Keep \`spec.md\` focused on requirements and scenarios.
- Update these specs whenever observable behavior changes.
`,
      description: "Living specs starter guide",
    },
  ];

  if (moduleIds.includes("decision-records")) {
    files.push({
      path: "specs/decisions/README.md",
      content: `# Architecture Decision Records

\`specs/decisions/\` stores ADRs that preserve architectural and workflow intent.

- Create a new ADR when a material decision is introduced or superseded.
- Reference the superseded ADR instead of rewriting history.
- Read relevant ADRs before changing areas they govern.
`,
      description: "ADR starter guide",
    });
  }

  if (moduleIds.includes("frontend")) {
    files.push({
      path: "specs/ui/README.md",
      content: `# Frontend Design System

\`specs/ui/\` stores the project's living style guide and UI design tokens.

- \`style-guide.md\`: The canonical source of truth for design tokens and UI patterns.
- Update the style guide whenever new tokens or patterns are identified.
`,
      description: "Frontend design system starter guide",
    });
  }

  return files;
}

export function getLocalFiles(
  tools: Tool[],
  moduleIds?: StandardModuleSelection[],
  options?: InstallOptions,
): InstallFile[] {
  const profile = createFrameworkProfile(moduleIds, {
    britishEnglish: options?.britishEnglish,
  });
  const files: InstallFile[] = [
    {
      path: "FRAMEWORK.md",
      content: generateFramework(profile.modules, options),
      description: "Framework rules (source of truth)",
    },
    {
      path: "AGENTS.md",
      content: generateAgents(profile.modules, options),
      description: "Agent instructions (standard convention)",
    },
    {
      path: ".aircury/framework.config.json",
      content: `${JSON.stringify(profile, null, 2)}\n`,
      description: "Installed standards profile",
    },
    ...getSpecsFiles(profile.modules),
  ];

  if (tools.includes("claude-code")) {
    files.push({
      path: "CLAUDE.md",
      content: generateAgents(profile.modules, options),
      description: "Agent instructions for Claude Code",
    });
  }

  if (tools.includes("gemini-cli")) {
    files.push({
      path: "GEMINI.md",
      content: generateAgents(profile.modules, options),
      description: "Agent instructions for Gemini CLI",
    });
  }

  return files;
}

export function getGlobalFiles(tools: Tool[]): InstallFile[] {
  void tools;
  return [];
}

function getLocalSkillAgents(tools: Tool[]): string[] {
  const agents = new Set<string>(["universal"]);

  if (tools.includes("claude-code")) agents.add("claude-code");
  if (tools.includes("gemini-cli")) agents.add("gemini-cli");
  if (tools.includes("opencode")) agents.add("opencode");

  return [...agents];
}

function getGlobalSkillAgents(agentIds: string[]): string[] {
  return [...new Set(agentIds.map((agent) => agent.trim()).filter(Boolean))];
}

function buildSkillsAddCommand(
  source: string,
  skillNames: string[],
  agents: string[],
  isGlobal: boolean,
): InstallCommand | null {
  if (agents.length === 0 || skillNames.length === 0) return null;

  const args = ["-y", "skills", "add", source];
  for (const skillName of skillNames) {
    args.push("--skill", skillName);
  }
  for (const agent of agents) {
    args.push("-a", agent);
  }
  if (isGlobal) {
    args.push("-g");
  }
  args.push("-y");

  return {
    command: "npx",
    args,
    description: `Install selected skills from ${source}`,
  };
}

function buildSkillsCommands(
  selectedSkillGroupIds: string[],
  agents: string[],
  isGlobal: boolean,
): InstallCommand[] {
  if (agents.length === 0) return [];

  const scope: "local" | "global" = isGlobal ? "global" : "local";
  const skills = expandSkillGroups(selectedSkillGroupIds, scope);
  const skillsBySource = new Map<string, string[]>();

  for (const skill of skills) {
    const names = skillsBySource.get(skill.source) ?? [];
    names.push(skill.skillName);
    skillsBySource.set(skill.source, names);
  }

  return [...skillsBySource.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([source, skillNames]) =>
      buildSkillsAddCommand(source, skillNames, agents, isGlobal),
    )
    .filter((command): command is InstallCommand => command !== null);
}

export function getLocalCommands(
  tools: Tool[],
  selectedSkillGroupIds: string[],
): InstallCommand[] {
  return buildSkillsCommands(
    selectedSkillGroupIds,
    getLocalSkillAgents(tools),
    false,
  );
}

export function getGlobalCommands(
  agentIds: string[],
  selectedSkillGroupIds: string[],
): InstallCommand[] {
  return buildSkillsCommands(
    selectedSkillGroupIds,
    getGlobalSkillAgents(agentIds),
    true,
  );
}

export interface ConflictResult {
  file: InstallFile;
  exists: boolean;
}

export function checkConflicts(
  files: InstallFile[],
  cwd: string,
  isGlobal: boolean,
): ConflictResult[] {
  return files.map((file) => ({
    file,
    exists: existsSync(isGlobal ? file.path : join(cwd, file.path)),
  }));
}

export function writeFile(
  file: InstallFile,
  cwd: string,
  isGlobal: boolean,
): void {
  const fullPath = isGlobal ? file.path : join(cwd, file.path);
  if (!isGlobal && file.path === "AGENTS.md" && existsSync(fullPath)) {
    writeFileSync(
      fullPath,
      mergeFrameworkReferenceIntoAgents(
        readFileSync(fullPath, "utf-8"),
        file.content,
      ),
      "utf-8",
    );
    return;
  }

  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, "utf-8");
}

export function mergeFrameworkReferenceIntoAgents(
  existingContent: string,
  frameworkReference: string,
): string {
  const trimmedExisting = existingContent.trim();
  const trimmedReference = frameworkReference.trim();

  if (trimmedExisting.length === 0) {
    return `${trimmedReference}\n`;
  }

  if (
    trimmedExisting.startsWith("# AGENTS.md") &&
    trimmedExisting.includes(LEGACY_AIRCURY_AGENTS_SENTENCE)
  ) {
    return `${trimmedReference}\n`;
  }

  if (trimmedExisting.includes(FRAMEWORK_REFERENCE_SENTENCE)) {
    return `${trimmedExisting}\n`;
  }

  return `${trimmedExisting}\n\n${trimmedReference}\n`;
}

export function runCommand(
  installCommand: InstallCommand,
  cwd: string,
): { success: boolean; stdout: string; stderr: string } {
  const result = spawnSync(installCommand.command, installCommand.args, {
    cwd,
    encoding: "utf-8",
    stdio: "pipe",
  });

  return {
    success: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

const GITIGNORE_ENTRY = "# Aircury AI Framework\nspecs/changes/";

export function updateGitignore(cwd: string): {
  updated: boolean;
  created: boolean;
} {
  const gitignorePath = join(cwd, ".gitignore");
  const hasGitignore = existsSync(gitignorePath);

  if (!hasGitignore) {
    writeFileSync(gitignorePath, `${GITIGNORE_ENTRY}\n`, "utf-8");
    return { updated: true, created: true };
  }

  const content = readFileSync(gitignorePath, "utf-8");
  if (content.includes("specs/changes/")) {
    return { updated: false, created: false };
  }

  const separator = content.endsWith("\n") ? "" : "\n";
  writeFileSync(
    gitignorePath,
    `${content}${separator}${GITIGNORE_ENTRY}\n`,
    "utf-8",
  );
  return { updated: true, created: false };
}
