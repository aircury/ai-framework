import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { tmpdir } from 'node:os';
import { getLocalFiles, getGlobalFiles, checkConflicts, writeFile } from './install';
import { skills, FRAMEWORK, AGENTS } from './templates';

const SKILL_COUNT = Object.keys(skills).length;

describe('getLocalFiles', () => {
  it('always includes FRAMEWORK.md and AGENTS.md', () => {
    const files = getLocalFiles([]);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('FRAMEWORK.md');
    expect(paths).toContain('AGENTS.md');
  });

  it('includes CLAUDE.md and .claude/commands/ skills when claude-code selected', () => {
    const files = getLocalFiles(['claude-code']);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('CLAUDE.md');
    const claudeSkills = paths.filter((p) => p.startsWith('.claude/skills/'));
    expect(claudeSkills).toHaveLength(SKILL_COUNT);
  });

  it('includes .opencode/agents/sdd.md when opencode selected', () => {
    const files = getLocalFiles(['opencode']);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('.opencode/agents/sdd.md');
  });

  it('does not include CLAUDE.md when claude-code not selected', () => {
    const files = getLocalFiles(['opencode']);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain('CLAUDE.md');
  });

  it('does not include .opencode/agents/sdd.md when opencode not selected', () => {
    const files = getLocalFiles(['claude-code']);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain('.opencode/agents/sdd.md');
  });

  it('always installs .agents/skills/ regardless of tools', () => {
    const files = getLocalFiles([]);
    const skillPaths = files.map((f) => f.path).filter((p) => p.startsWith('.agents/skills/'));
    expect(skillPaths).toHaveLength(SKILL_COUNT);
  });

  it('FRAMEWORK.md content matches the template', () => {
    const files = getLocalFiles([]);
    const fw = files.find((f) => f.path === 'FRAMEWORK.md')!;
    expect(fw.content).toBe(FRAMEWORK);
  });

  it('CLAUDE.md content matches AGENTS.md content', () => {
    const files = getLocalFiles(['claude-code']);
    const claude = files.find((f) => f.path === 'CLAUDE.md')!;
    const agents = files.find((f) => f.path === 'AGENTS.md')!;
    expect(claude.content).toBe(agents.content);
    expect(claude.content).toBe(AGENTS);
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
