import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createFrameworkProfile } from './framework';
import type { StandardModuleId } from './framework';
import { generateFramework, generateAgents } from './templates';

export type Tool = 'claude-code' | 'gemini-cli';
export type Scope = 'local' | 'global';

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

const SKILLS_SOURCE = 'aircury/ai-framework';

function getSpecsFiles(moduleIds: StandardModuleId[]): InstallFile[] {
  const files: InstallFile[] = [
    {
      path: 'specs/features/README.md',
      content: `# Living Specifications

\`specs/features/\` stores the canonical, technology-agnostic description of observable system behavior.

- Create one folder per capability.
- Keep \`spec.md\` focused on requirements and scenarios.
- Update these specs whenever observable behavior changes.
`,
      description: 'Living specs starter guide',
    },
  ];

  if (moduleIds.includes('decision-records')) {
    files.push({
      path: 'specs/decisions/README.md',
      content: `# Architecture Decision Records

\`specs/decisions/\` stores ADRs that preserve architectural and workflow intent.

- Create a new ADR when a material decision is introduced or superseded.
- Reference the superseded ADR instead of rewriting history.
- Read relevant ADRs before changing areas they govern.
`,
      description: 'ADR starter guide',
    });
  }

  return files;
}

export function getLocalFiles(
  tools: Tool[],
  moduleIds?: StandardModuleId[],
): InstallFile[] {
  const profile = createFrameworkProfile(moduleIds);
  const files: InstallFile[] = [
    {
      path: 'FRAMEWORK.md',
      content: generateFramework(profile.modules),
      description: 'Framework rules (source of truth)',
    },
    {
      path: 'AGENTS.md',
      content: generateAgents(profile.modules),
      description: 'Agent instructions (standard convention)',
    },
    {
      path: '.aircury/framework.config.json',
      content: `${JSON.stringify(profile, null, 2)}\n`,
      description: 'Installed standards profile',
    },
    ...getSpecsFiles(profile.modules),
  ];

  if (tools.includes('claude-code')) {
    files.push({
      path: 'CLAUDE.md',
      content: generateAgents(profile.modules),
      description: 'Agent instructions for Claude Code',
    });
  }

  if (tools.includes('gemini-cli')) {
    files.push({
      path: 'GEMINI.md',
      content: generateAgents(profile.modules),
      description: 'Agent instructions for Gemini CLI',
    });
  }

  return files;
}

export function getGlobalFiles(tools: Tool[]): InstallFile[] {
  void tools;
  return [];
}

function getLocalSkillAgents(tools: Tool[]): string[] {
  const agents = new Set<string>(['universal']);

  if (tools.includes('claude-code')) agents.add('claude-code');
  if (tools.includes('gemini-cli')) agents.add('gemini-cli');

  return [...agents];
}

function getGlobalSkillAgents(tools: Tool[]): string[] {
  const agents = new Set<string>();

  if (tools.includes('claude-code')) agents.add('claude-code');
  if (tools.includes('gemini-cli')) agents.add('gemini-cli');

  return [...agents];
}

function buildSkillsAddCommand(agents: string[], isGlobal: boolean): InstallCommand | null {
  if (agents.length === 0) return null;

  const args = ['-y', 'skills', 'add', SKILLS_SOURCE, '--skill', '*'];
  for (const agent of agents) {
    args.push('-a', agent);
  }
  if (isGlobal) {
    args.push('-g');
  }
  args.push('-y');

  return {
    command: 'npx',
    args,
    description: `Install Aircury skills via skills CLI for ${agents.join(', ')}`,
  };
}

export function getLocalCommands(tools: Tool[]): InstallCommand[] {
  const command = buildSkillsAddCommand(getLocalSkillAgents(tools), false);
  return command ? [command] : [];
}

export function getGlobalCommands(tools: Tool[]): InstallCommand[] {
  const command = buildSkillsAddCommand(getGlobalSkillAgents(tools), true);
  return command ? [command] : [];
}

export interface ConflictResult {
  file: InstallFile;
  exists: boolean;
}

export function checkConflicts(files: InstallFile[], cwd: string, isGlobal: boolean): ConflictResult[] {
  return files.map((file) => ({
    file,
    exists: existsSync(isGlobal ? file.path : join(cwd, file.path)),
  }));
}

export function writeFile(file: InstallFile, cwd: string, isGlobal: boolean): void {
  const fullPath = isGlobal ? file.path : join(cwd, file.path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, 'utf-8');
}

export function runCommand(
  installCommand: InstallCommand,
  cwd: string,
): { success: boolean; stdout: string; stderr: string } {
  const result = spawnSync(installCommand.command, installCommand.args, {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  return {
    success: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

const GITIGNORE_ENTRY = '# Aircury AI Framework\nspecs/changes/';

export function updateGitignore(cwd: string): { updated: boolean; created: boolean } {
  const gitignorePath = join(cwd, '.gitignore');
  const hasGitignore = existsSync(gitignorePath);

  if (!hasGitignore) {
    writeFileSync(gitignorePath, `${GITIGNORE_ENTRY}\n`, 'utf-8');
    return { updated: true, created: true };
  }

  const content = readFileSync(gitignorePath, 'utf-8');
  if (content.includes('specs/changes/')) {
    return { updated: false, created: false };
  }

  const separator = content.endsWith('\n') ? '' : '\n';
  writeFileSync(gitignorePath, `${content}${separator}${GITIGNORE_ENTRY}\n`, 'utf-8');
  return { updated: true, created: false };
}
