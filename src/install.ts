import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CapabilityId,
  type CapabilityScope,
  type CapabilitySkill,
  createCapabilityProfile,
  FRAMEWORK_MAINTAINED_NOTICE,
  getCapabilityFiles,
  getCapabilitySkills,
} from "./capabilities";
import featuresReadme from "./install-content/specs/features/README.md" with {
  type: "text",
};
import { generateAgents, generateFramework } from "./templates";

export type Tool = "claude-code" | "cursor" | "gemini-cli";
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

export interface ClaudeSkillsSyncResult {
  copied: string[];
  missing: string[];
}

type SkillsRunner = "npx" | "bunx";
let cachedSkillsRunner: SkillsRunner | null = null;

const AIRCURY_SKILLS_SOURCE = "aircury/ai-framework";

function getLocalAircurySkillsSource(): string | null {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const root = join(moduleDir, "..");

  if (existsSync(join(root, "src")) && existsSync(join(root, "skills"))) {
    return root;
  }

  return null;
}

export function getAircurySkillsSource(): string {
  return (
    process.env.AIRCURY_SKILLS_SOURCE?.trim() ||
    getLocalAircurySkillsSource() ||
    AIRCURY_SKILLS_SOURCE
  );
}

function resolveSkillSource(source: string): string {
  if (source !== AIRCURY_SKILLS_SOURCE) return source;

  return getAircurySkillsSource();
}

const FRAMEWORK_REFERENCE_SENTENCE =
  "This project follows the Aircury engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).";
const MERGEABLE_FRAMEWORK_ENTRYPOINTS = new Set(["AGENTS.md", "CLAUDE.md"]);
const CURSOR_RULES_PATH = ".cursorrules";
const FRAMEWORK_LOCAL_PATH = "FRAMEWORK.local.md";
const AGENTS_FRAMEWORK_SECTION_HEADING = "## Framework";
const AGENTS_FRAMEWORK_SECTION_NOTICE =
  "> Framework-managed section. Add project-specific instructions outside this section.";
const CURSOR_COMMIT_RULES_HEADING = "## Aircury Commit Rules";
const FRAMEWORK_LOCAL_CONTENT = `# FRAMEWORK.local.md

Project-specific instructions, additions, and overrides for this repository.

This file is intentionally local to the project. Aircury AI Framework installs it as a starter file but never overwrites it during updates.

Add repository-specific rules below.
`;
const CURSOR_COMMIT_RULES_SECTION = `## Aircury Commit Rules

${FRAMEWORK_MAINTAINED_NOTICE}

When creating git commits in this repository, follow this workflow:

- Analyse the workspace with git status and git diff before committing.
- Group changes semantically. Each commit must be atomic: one functional change per commit.
- Use conventional commit messages in the format <type>(<scope>): <description> without a body. Allowed types: feat, fix, refactor, docs, style, test, chore, perf, ci, build, revert.
- Never include Co-authored-by, Authored-by, AI tool signatures, generated-by markers, bot attribution, or any metadata that reveals or implies AI involvement in the final commit object. The AI must leave no trace that it authored, co-authored, generated, assisted, or executed the commit under any circumstance.
- Do not use commit bodies, trailers, templates, --author, --trailer, --template, -F, --file, -C, -c, git interpret-trailers, amend, reword, hooks, or external commit tools to add, preserve, or hide AI attribution, co-authorship, generated-by metadata, bot attribution, or tool signatures.
- Treat variants such as Co-authored by, Generated with, AI-assisted, Assisted-by, Tool, Cursor-Agent, Signed-off-by with an AI/bot identity, unusual casing, extra whitespace, or Unicode punctuation as prohibited AI attribution.
- Use git add for specific files per commit, never git add . unless all changes belong to one commit.
- After each commit, run git log -1 --format=%B and verify the final message contains no AI-related attribution or metadata, then run git status to verify success.
- Stage and commit one group at a time. Do not skip ahead.
`;

export function isMergeableFrameworkEntrypoint(path: string): boolean {
  return MERGEABLE_FRAMEWORK_ENTRYPOINTS.has(path);
}

export function isMergeableCursorRules(path: string): boolean {
  return path === CURSOR_RULES_PATH;
}

export function isProtectedLocalCompanion(path: string): boolean {
  return path === FRAMEWORK_LOCAL_PATH;
}

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
      path: FRAMEWORK_LOCAL_PATH,
      content: FRAMEWORK_LOCAL_CONTENT,
      description: "Project-specific framework instructions",
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

  if (tools.includes("cursor")) {
    files.push({
      path: CURSOR_RULES_PATH,
      content: CURSOR_COMMIT_RULES_SECTION,
      description: "Cursor commit rules",
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
  const resolvedSource = resolveSkillSource(source);
  const args = ["-y", "skills", "add", resolvedSource];
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
    description: `Install selected skills from ${resolvedSource}`,
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
  if (
    !isGlobal &&
    isProtectedLocalCompanion(file.path) &&
    existsSync(fullPath)
  ) {
    return;
  }

  if (
    !isGlobal &&
    isMergeableFrameworkEntrypoint(file.path) &&
    existsSync(fullPath)
  ) {
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

  if (!isGlobal && isMergeableCursorRules(file.path) && existsSync(fullPath)) {
    writeFileSync(
      fullPath,
      mergeCursorRules(readFileSync(fullPath, "utf-8"), file.content),
      "utf-8",
    );
    return;
  }

  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, "utf-8");
}

export function syncClaudeCodeSkills(
  cwd: string,
  skills: CapabilitySkill[],
): ClaudeSkillsSyncResult {
  const copied: string[] = [];
  const missing: string[] = [];
  const uniqueSkills = [
    ...new Map(skills.map((skill) => [skill.skillName, skill])).values(),
  ].sort((left, right) => left.skillName.localeCompare(right.skillName));

  if (uniqueSkills.length === 0) {
    return { copied, missing };
  }

  const sourceRoot = join(cwd, ".agents", "skills");
  const targetRoot = join(cwd, ".claude", "skills");
  mkdirSync(targetRoot, { recursive: true });

  for (const skill of uniqueSkills) {
    const source = join(sourceRoot, skill.skillName);
    if (!existsSync(source)) {
      const fallbackSource = getAircurySkillFallbackSource(skill);
      if (!fallbackSource) {
        missing.push(skill.skillName);
        continue;
      }

      cpSync(fallbackSource, source, {
        recursive: true,
        force: true,
      });
    }

    const target = join(targetRoot, skill.skillName);
    if (areSamePath(source, target)) {
      copied.push(skill.skillName);
      continue;
    }

    cpSync(source, target, {
      recursive: true,
      force: true,
    });
    copied.push(skill.skillName);
  }

  return { copied, missing };
}

function areSamePath(source: string, target: string): boolean {
  if (!existsSync(source) || !existsSync(target)) return false;

  return realpathSync(source) === realpathSync(target);
}

function getAircurySkillFallbackSource(skill: CapabilitySkill): string | null {
  if (skill.source !== AIRCURY_SKILLS_SOURCE) return null;

  const source = join(getAircurySkillsSource(), "skills", skill.skillName);
  if (!existsSync(source)) return null;

  return source;
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
    if (trimmedExisting.includes(AGENTS_FRAMEWORK_SECTION_NOTICE)) {
      return `${trimmedExisting}\n`;
    }

    if (trimmedExisting.includes(AGENTS_FRAMEWORK_SECTION_HEADING)) {
      return `${trimmedExisting.replace(
        AGENTS_FRAMEWORK_SECTION_HEADING,
        `${AGENTS_FRAMEWORK_SECTION_HEADING}\n\n${AGENTS_FRAMEWORK_SECTION_NOTICE}`,
      )}\n`;
    }

    return `${trimmedExisting}\n`;
  }

  return `${trimmedExisting}\n\n${trimmedReference}\n`;
}

export function mergeCursorRules(
  existingContent: string,
  cursorCommitRules: string,
): string {
  const trimmedExisting = existingContent.trim();
  const trimmedRules = cursorCommitRules.trim();

  if (trimmedExisting.length === 0) {
    return `${trimmedRules}\n`;
  }

  if (trimmedExisting.includes(CURSOR_COMMIT_RULES_HEADING)) {
    if (trimmedExisting.includes(FRAMEWORK_MAINTAINED_NOTICE)) {
      return `${trimmedExisting}\n`;
    }

    return `${trimmedExisting.replace(
      CURSOR_COMMIT_RULES_HEADING,
      `${CURSOR_COMMIT_RULES_HEADING}\n\n${FRAMEWORK_MAINTAINED_NOTICE}`,
    )}\n`;
  }

  return `${trimmedExisting}\n\n${trimmedRules}\n`;
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
