import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { createFrameworkProfile } from './framework';
import type { StandardModuleId } from './framework';
import { generateFramework, generateAgents, skills } from './templates';

export type Tool = 'claude-code' | 'gemini-cli';
export type Scope = 'local' | 'global';

export interface InstallFile {
  path: string;
  content: string;
  description: string;
}

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
      content: generateAgents(profile.modules),
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
