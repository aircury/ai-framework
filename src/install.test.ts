import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { tmpdir } from 'node:os';
import { getLocalFiles, getGlobalFiles, checkConflicts, writeFile } from './install';
import { skills } from './templates';

const SKILL_COUNT = Object.keys(skills).length;

describe('getLocalFiles', () => {
  it('always includes FRAMEWORK.md and AGENTS.md', () => {
    const files = getLocalFiles([]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('FRAMEWORK.md');
    expect(paths).toContain('AGENTS.md');
    expect(paths).toContain('.aircury/framework.config.json');
  });

  it('includes CLAUDE.md and .claude/commands/ skills when claude-code selected', () => {
    const files = getLocalFiles(['claude-code']);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('CLAUDE.md');
    const claudeSkills = paths.filter((p) => p.startsWith('.claude/skills/'));
    expect(claudeSkills).toHaveLength(SKILL_COUNT);
  });

  it('includes GEMINI.md when gemini-cli selected', () => {
    const files = getLocalFiles(['gemini-cli']);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('GEMINI.md');
  });

  it('does not include CLAUDE.md when claude-code not selected', () => {
    const files = getLocalFiles(['gemini-cli']);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain('CLAUDE.md');
  });

  it('does not include GEMINI.md when gemini-cli not selected', () => {
    const files = getLocalFiles(['claude-code']);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain('GEMINI.md');
  });

  it('GEMINI.md content matches AGENTS.md content', () => {
    const files = getLocalFiles(['gemini-cli']);
    const gemini = files.find((f) => f.path === 'GEMINI.md')!;
    const agents = files.find((f) => f.path === 'AGENTS.md')!;
    expect(gemini.content).toBe(agents.content);
  });

  it('always installs .agents/skills/ regardless of tools', () => {
    const files = getLocalFiles([]);
    const skillPaths = files.map((f) => f.path).filter((p) => p.startsWith('.agents/skills/'));
    expect(skillPaths).toHaveLength(SKILL_COUNT);
  });

  it('persists the selected standards modules in a config file', () => {
    const files = getLocalFiles([], ['decision-records', 'tdd']);
    const config = files.find((f) => f.path === '.aircury/framework.config.json');
    expect(config).toBeDefined();
    expect(config!.content).toContain('"decision-records"');
    expect(config!.content).toContain('"tdd"');
  });

  it('generates framework content from the selected modules', () => {
    const files = getLocalFiles([], ['decision-records']);
    const framework = files.find((f) => f.path === 'FRAMEWORK.md')!;
    expect(framework.content).toContain('## Architecture Decision Records');
    expect(framework.content).not.toContain('## TDD Workflow');
    expect(framework.content).not.toContain('## Non-Negotiable Architecture Rules');
  });

  it('includes ADR instructions in AGENTS.md when the ADR module is enabled', () => {
    const files = getLocalFiles([], ['decision-records']);
    const agents = files.find((f) => f.path === 'AGENTS.md')!;
    expect(agents.content).toContain('specs/decisions/');
  });

  it('omits ADR instructions when the ADR module is disabled', () => {
    const files = getLocalFiles([], []);
    const agents = files.find((f) => f.path === 'AGENTS.md')!;
    expect(agents.content).not.toContain('specs/decisions/');
  });

  it('uses the full recommended profile by default', () => {
    const files = getLocalFiles([]);
    const framework = files.find((f) => f.path === 'FRAMEWORK.md')!;
    expect(framework.content).toContain('## TDD Workflow');
    expect(framework.content).toContain('## Non-Negotiable Architecture Rules');
    expect(framework.content).toContain('## Architecture Decision Records');
  });

  it('CLAUDE.md content matches AGENTS.md content', () => {
    const files = getLocalFiles(['claude-code']);
    const claude = files.find((f) => f.path === 'CLAUDE.md')!;
    const agents = files.find((f) => f.path === 'AGENTS.md')!;
    expect(claude.content).toBe(agents.content);
  });
});

describe('getGlobalFiles', () => {
  it('returns empty array when no tools selected', () => {
    expect(getGlobalFiles([])).toHaveLength(0);
  });

  it('returns Claude Code global commands under ~/.claude/commands/', () => {
    const files = getGlobalFiles(['claude-code']);
    expect(files).toHaveLength(SKILL_COUNT);
    const home = homedir();
    for (const file of files) {
      expect(file.path).toStartWith(join(home, '.claude', 'skills'));
    }
  });
});

describe('checkConflicts', () => {
  it('marks non-existing files as not conflicting', () => {
    const files = getLocalFiles([]);
    const results = checkConflicts(files, '/nonexistent-path-xyz', false);
    for (const result of results) {
      expect(result.exists).toBe(false);
    }
  });

  it('marks existing files as conflicting', () => {
    const dir = tmpdir();
    // FRAMEWORK.md exists in the project root — use that as cwd
    const cwd = join(import.meta.dir, '..');
    const files = [{ path: 'FRAMEWORK.md', content: '', description: '' }];
    const results = checkConflicts(files, cwd, false);
    expect(results[0].exists).toBe(true);
  });
});

describe('writeFile', () => {
  it('writes a local file to the correct path under cwd', () => {
    const dir = `${tmpdir()}/sdd-test-${Date.now()}`;
    const file = { path: 'subdir/test.md', content: '# hello', description: '' };

    writeFile(file, dir, false);

    const fullPath = join(dir, 'subdir/test.md');
    expect(existsSync(fullPath)).toBe(true);
    expect(readFileSync(fullPath, 'utf-8')).toBe('# hello');

    rmSync(dir, { recursive: true });
  });

  it('writes a global file using the absolute path directly', () => {
    const dir = `${tmpdir()}/sdd-global-test-${Date.now()}`;
    const file = { path: `${dir}/commands/skill.md`, content: '# skill', description: '' };

    writeFile(file, '/irrelevant', true);

    expect(existsSync(file.path)).toBe(true);
    expect(readFileSync(file.path, 'utf-8')).toBe('# skill');

    rmSync(dir, { recursive: true });
  });

  it('creates intermediate directories as needed', () => {
    const dir = `${tmpdir()}/sdd-mkdir-test-${Date.now()}`;
    const file = { path: 'a/b/c/deep.md', content: 'deep', description: '' };

    writeFile(file, dir, false);

    expect(existsSync(join(dir, 'a/b/c/deep.md'))).toBe(true);

    rmSync(dir, { recursive: true });
  });
});
