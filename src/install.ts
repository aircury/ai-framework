import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { FRAMEWORK, AGENTS, skills } from './templates';

export type Tool = 'claude-code' | 'gemini-cli';
export type Scope = 'local' | 'global';

export interface InstallFile {
  path: string;
  content: string;
  description: string;
}

export function getLocalFiles(tools: Tool[]): InstallFile[] {
  const files: InstallFile[] = [
    {
      path: 'FRAMEWORK.md',
      content: FRAMEWORK,
      description: 'Framework rules (source of truth)',
    },
    {
      path: 'AGENTS.md',
      content: AGENTS,
      description: 'Agent instructions (standard convention)',
    },
  ];

  if (tools.includes('claude-code')) {
    files.push({
      path: 'CLAUDE.md',
      content: AGENTS,
      description: 'Agent instructions for Claude Code',
    });

    for (const [name, content] of Object.entries(skills)) {
      files.push({
        path: `.claude/skills/${name}/SKILL.md`,
        content,
        description: `${name} skill for Claude Code`,
      });
    }
  }

  if (tools.includes('gemini-cli')) {
    files.push({
      path: 'GEMINI.md',
      content: AGENTS,
      description: 'Agent instructions for Gemini CLI',
    });
  }

  // Always install .agents/skills/ as the canonical skill location
  for (const [name, content] of Object.entries(skills)) {
    files.push({
      path: `.agents/skills/${name}/SKILL.md`,
      content,
      description: `${name} skill`,
    });
  }

  return files;
}

export function getGlobalFiles(tools: Tool[]): InstallFile[] {
  const files: InstallFile[] = [];
  const home = homedir();

  if (tools.includes('claude-code')) {
    for (const [name, content] of Object.entries(skills)) {
      files.push({
        path: join(home, '.claude', 'skills', name, 'SKILL.md'),
        content,
        description: `${name} skill (global Claude Code)`,
      });
    }
  }

  return files;
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
