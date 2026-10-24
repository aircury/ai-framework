import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CapabilityId,
  type CapabilityProfile,
  type CapabilityScope,
  createCapabilityProfile,
  FRAMEWORK_MAINTAINED_NOTICE,
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
  /** The framework version recorded in the profile; read from the published package by default. */
  frameworkVersion?: string;
}

/**
 * The version of the installed package, from the `package.json` npm publishes beside `dist/`.
 * A source checkout's `package.json` carries none (semantic-release sets it at publish time).
 */
export function getFrameworkVersion(): string | undefined {
  try {
    const packageJson = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json",
    );
    const version: unknown = JSON.parse(
      readFileSync(packageJson, "utf-8"),
    ).version;
    return typeof version === "string" ? version : undefined;
  } catch {
    return undefined;
  }
}

type SkillsRunner = "npx" | "bunx";
let cachedSkillsRunner: SkillsRunner | null = null;

const AIRCURY_SKILLS_SOURCE = "aircury/ai-framework";
const PROJECT_PROFILE_PATH = ".aircury/framework.config.json";

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
const FRAMEWORK_LOCAL_PATH = "FRAMEWORK.local.md";
const AGENTS_FRAMEWORK_SECTION_HEADING = "## Framework";
const AGENTS_FRAMEWORK_SECTION_NOTICE =
  "> Framework-managed section. Add project-specific instructions outside this section.";
const FRAMEWORK_LOCAL_CONTENT = `# FRAMEWORK.local.md

Project-specific instructions, additions, and overrides for this repository.

This file is intentionally local to the project. Aircury AI Framework installs it as a starter file but never overwrites it during updates.

Add repository-specific rules below.
`;

export function isMergeableFrameworkEntrypoint(path: string): boolean {
  return MERGEABLE_FRAMEWORK_ENTRYPOINTS.has(path);
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
    tools,
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
      path: PROJECT_PROFILE_PATH,
      content: `${JSON.stringify(withFrameworkVersion(profile, options?.frameworkVersion ?? getFrameworkVersion()), null, 2)}\n`,
      description: "Installed capability profile",
    },
    ...getBaseFiles(),
    ...getCapabilityFiles(profile.capabilities, "local"),
  ];

  if (tools.includes("claude-code")) {
    files.push({
      path: "CLAUDE.md",
      content: titled(
        generateAgents(profile.capabilities, options),
        "CLAUDE.md",
      ),
      description: "Agent instructions for Claude Code",
    });
  }

  if (tools.includes("gemini-cli")) {
    files.push({
      path: "GEMINI.md",
      content: titled(
        generateAgents(profile.capabilities, options),
        "GEMINI.md",
      ),
      description: "Agent instructions for Gemini CLI",
    });
  }

  return files;
}

function withFrameworkVersion(
  profile: CapabilityProfile,
  frameworkVersion: string | undefined,
): CapabilityProfile & { frameworkVersion?: string } {
  if (!frameworkVersion) return profile;
  const { version, ...rest } = profile;
  return { version, frameworkVersion, ...rest };
}

/** The agent entrypoints share one template, titled `# AGENTS.md`; each copy carries its own file name. */
function titled(agentsContent: string, fileName: string): string {
  return agentsContent.replace(/^# AGENTS\.md\n/, `# ${fileName}\n`);
}

export function readProjectProfile(cwd: string): CapabilityProfile | null {
  const profilePath = join(cwd, PROJECT_PROFILE_PATH);
  if (!existsSync(profilePath)) return null;

  try {
    const profile: unknown = JSON.parse(readFileSync(profilePath, "utf-8"));
    return isProjectProfile(profile) ? profile : null;
  } catch {
    return null;
  }
}

function isProjectProfile(value: unknown): value is CapabilityProfile {
  if (!value || typeof value !== "object") return false;

  const profile = value as Partial<CapabilityProfile>;
  return (
    profile.version === 2 &&
    Array.isArray(profile.capabilities) &&
    profile.capabilities.every(
      (capability) => typeof capability === "string",
    ) &&
    (profile.tools === undefined ||
      (Array.isArray(profile.tools) &&
        profile.tools.every((tool) => typeof tool === "string"))) &&
    typeof profile.language === "object" &&
    profile.language !== null &&
    typeof profile.language.britishEnglish === "boolean"
  );
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

const PROJECT_SKILLS_PATH = ".agents/skills";

export interface SkillsSubmodule {
  path: string;
  /** False when the submodule is declared but not checked out: what it provides is unknown. */
  initialised: boolean;
  provided: string[];
  missing: string[];
}

export interface LocalSkillsPlan {
  commands: InstallCommand[];
  submodule: SkillsSubmodule | null;
}

function isGitSubmodulePath(cwd: string, path: string): boolean {
  const gitmodules = join(cwd, ".gitmodules");
  if (!existsSync(gitmodules)) return false;
  return readFileSync(gitmodules, "utf-8")
    .split("\n")
    .some((line) => /^\s*path\s*=\s*(.+?)\s*$/.exec(line)?.[1] === path);
}

function listSkillNames(dir: string): Set<string> {
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && existsSync(join(dir, entry.name, "SKILL.md")),
      )
      .map((entry) => entry.name),
  );
}

/**
 * Skills install into `.agents/skills`. When a project keeps that directory as a
 * git submodule, the submodule's repository owns every skill in it: writing there
 * would leave the submodule dirty and replace its versions with ours. So nothing
 * is installed, and the plan says which selected skills the submodule lacks.
 */
export function planLocalSkills(
  tools: Tool[],
  capabilityIds: CapabilityId[],
  cwd: string,
): LocalSkillsPlan {
  if (!isGitSubmodulePath(cwd, PROJECT_SKILLS_PATH)) {
    return {
      commands: getLocalCommands(tools, capabilityIds),
      submodule: null,
    };
  }

  const present = listSkillNames(join(cwd, PROJECT_SKILLS_PATH));
  const selected = [
    ...new Set(
      getCapabilitySkills(capabilityIds, "local").map(
        (skill) => skill.skillName,
      ),
    ),
  ].sort();

  return {
    commands: [],
    submodule: {
      path: PROJECT_SKILLS_PATH,
      initialised: present.size > 0,
      provided: selected.filter((name) => present.has(name)),
      missing: selected.filter((name) => !present.has(name)),
    },
  };
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

  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, "utf-8");
}

const FRAMEWORK_CAPABILITY_DOCS_DIR = "docs/aircury/capabilities";

export type FileAction =
  | "create"
  | "refresh"
  | "unchanged"
  | "merge"
  | "keep"
  | "remove";

export interface FileWrite {
  path: string;
  action: FileAction;
  file?: InstallFile;
}

// The notice's opening sentence; older installs (and Markdown formatters) split the rest over lines.
const FRAMEWORK_MAINTAINED_MARK = FRAMEWORK_MAINTAINED_NOTICE.slice(
  0,
  FRAMEWORK_MAINTAINED_NOTICE.indexOf(".") + 1,
);

function isFrameworkMaintained(content: string): boolean {
  return content.includes(FRAMEWORK_MAINTAINED_MARK);
}

/**
 * What an install does to each local file, decided by who owns it:
 * - a file carrying the framework-maintained notice belongs to the framework, so it is
 *   always brought to the current version (refresh), whatever was there;
 * - `AGENTS.md`, `CLAUDE.md` and `GEMINI.md` get the framework section merged in;
 * - every other file (`FRAMEWORK.local.md`, the `specs/` guides) is a starter that
 *   belongs to the project once it exists, and is never overwritten (keep);
 * - a framework-maintained capability document the profile no longer installs is removed,
 *   so a dropped capability leaves no rules behind.
 */
export function planFileWrites(files: InstallFile[], cwd: string): FileWrite[] {
  const plan: FileWrite[] = files.map((file) => {
    const fullPath = join(cwd, file.path);
    if (!existsSync(fullPath))
      return { path: file.path, action: "create", file };
    if (isMergeableFrameworkEntrypoint(file.path))
      return { path: file.path, action: "merge", file };
    if (!isFrameworkMaintained(file.content))
      return { path: file.path, action: "keep", file };
    const current = readFileSync(fullPath, "utf-8");
    return {
      path: file.path,
      action: current === file.content ? "unchanged" : "refresh",
      file,
    };
  });

  const installed = new Set(files.map((file) => file.path));
  const docsDir = join(cwd, FRAMEWORK_CAPABILITY_DOCS_DIR);
  if (existsSync(docsDir)) {
    for (const entry of readdirSync(docsDir, { withFileTypes: true })) {
      const path = `${FRAMEWORK_CAPABILITY_DOCS_DIR}/${entry.name}`;
      if (!entry.isFile() || installed.has(path)) continue;
      if (isFrameworkMaintained(readFileSync(join(cwd, path), "utf-8")))
        plan.push({ path, action: "remove" });
    }
  }

  return plan;
}

export function applyFileWrites(plan: FileWrite[], cwd: string): void {
  for (const { path, action, file } of plan) {
    if (action === "remove") {
      rmSync(join(cwd, path));
    } else if (file && action !== "keep" && action !== "unchanged") {
      writeFile(file, cwd, false);
    }
  }
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
