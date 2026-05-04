import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type CapabilityId,
  type CapabilityScope,
  createCapabilityProfile,
  getCapabilityFiles,
  getCapabilitySkills,
} from "./capabilities";
import featuresReadme from "./install-content/specs/features/README.md" with {
  type: "text",
};
import { generateAgents, generateFramework } from "./templates";

export type Tool = "claude-code" | "gemini-cli";
export type Scope = CapabilityScope;

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

type SkillsRunner = "npx" | "bunx";
let cachedSkillsRunner: SkillsRunner | null = null;

const FRAMEWORK_REFERENCE_SENTENCE =
  "This project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).";

function getBaseFiles(): InstallFile[] {
  return [
    {
      path: "specs/features/README.md",
      content: featuresReadme,
      description: "Living specs starter guide",
    },
  ];
}

export function getLocalFiles(
  tools: Tool[],
  capabilityIds?: CapabilityId[],
  options?: InstallOptions,
): InstallFile[] {
  const profile = createCapabilityProfile(capabilityIds, {
    britishEnglish: options?.britishEnglish,
  });
  const files: InstallFile[] = [
    {
      path: "FRAMEWORK.md",
      content: generateFramework(profile.capabilities, options),
      description: "Framework rules (source of truth)",
    },
    {
      path: "AGENTS.md",
      content: generateAgents(profile.capabilities, options),
      description: "Agent instructions (standard convention)",
    },
    {
      path: ".aircury/framework.config.json",
      content: `${JSON.stringify(profile, null, 2)}\n`,
      description: "Installed capability profile",
    },
    ...getBaseFiles(),
    ...getCapabilityFiles(profile.capabilities, "local"),
  ];

  if (tools.includes("claude-code")) {
    files.push({
      path: "CLAUDE.md",
      content: generateAgents(profile.capabilities, options),
      description: "Agent instructions for Claude Code",
    });
  }

  if (tools.includes("gemini-cli")) {
    files.push({
      path: "GEMINI.md",
      content: generateAgents(profile.capabilities, options),
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

  return [...agents];
}

function getGlobalSkillAgents(tools: Tool[]): string[] {
  const agents = new Set<string>(["universal"]);

  if (tools.includes("claude-code")) agents.add("claude-code");
  if (tools.includes("gemini-cli")) agents.add("gemini-cli");

  return [...agents];
}

function buildSkillsAddCommand(
  source: string,
  skillNames: string[],
  agents: string[],
  isGlobal: boolean,
): InstallCommand | null {
  if (agents.length === 0 || skillNames.length === 0) return null;

  const command = getSkillsRunner();
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
    command,
    args,
    description: `Install selected skills from ${source}`,
  };
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf-8",
    stdio: "ignore",
  });
  return !result.error && result.status === 0;
}

export function getSkillsRunner(): SkillsRunner {
  if (cachedSkillsRunner) return cachedSkillsRunner;
  if (commandExists("npx")) {
    cachedSkillsRunner = "npx";
    return cachedSkillsRunner;
  }
  cachedSkillsRunner = "bunx";
  return cachedSkillsRunner;
}

function buildCapabilityCommands(
  selectedCapabilityIds: CapabilityId[],
  agents: string[],
  scope: CapabilityScope,
  isGlobal: boolean,
): InstallCommand[] {
  if (agents.length === 0) return [];

  const skills = getCapabilitySkills(selectedCapabilityIds, scope);
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
  capabilityIds: CapabilityId[],
): InstallCommand[] {
  return buildCapabilityCommands(
    capabilityIds,
    getLocalSkillAgents(tools),
    "local",
    false,
  );
}

export function getGlobalCommands(
  tools: Tool[],
  capabilityIds: CapabilityId[],
): InstallCommand[] {
  return buildCapabilityCommands(
    capabilityIds,
    getGlobalSkillAgents(tools),
    "global",
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
    stderr: result.stderr || result.error?.message || "",
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
