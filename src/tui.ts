import * as p from '@clack/prompts';
import { STANDARD_MODULES } from './framework';
import type { StandardModuleId } from './framework';
import { getLocalFiles, getGlobalFiles, checkConflicts, writeFile } from './install';
import type { Tool, Scope } from './install';

export async function run(): Promise<void> {
  p.intro('Aircury AI Framework Installer');

  const scope = await p.select<Scope>({
    message: 'What do you want to configure?',
    options: [
      { value: 'local', label: 'Local', hint: 'configure this project' },
      { value: 'global', label: 'Global', hint: 'configure this machine' },
    ],
  });

  if (p.isCancel(scope)) return p.cancel('Cancelled.');

  if (scope === 'local') {
    const universalTools = ['Amp', 'Codex', 'Cursor', 'GitHub Copilot', 'Kilo Code', 'OpenCode'];
    p.note(
      universalTools.join(' · '),
      'Universal — always included via AGENTS.md + .agents/skills/',
    );
  }

  const toolOptions: { value: Tool; label: string; hint: string }[] = scope === 'global'
    ? [{ value: 'claude-code', label: 'Claude Code', hint: 'installs ~/.claude/skills/' }]
    : [
        { value: 'claude-code', label: 'Claude Code', hint: 'CLAUDE.md + .claude/skills/' },
        { value: 'gemini-cli', label: 'Gemini CLI', hint: 'GEMINI.md' },
      ];

  const selectedTools = await p.multiselect<Tool>({
    message: 'Additional tools — need tool-specific config',
    options: toolOptions,
    initialValues: toolOptions.map((o) => o.value),
  });

  if (p.isCancel(selectedTools)) return p.cancel('Cancelled.');

  let selectedModules: StandardModuleId[] = [];
  if (scope === 'local') {
    selectedModules = await p.multiselect<StandardModuleId>({
      message: 'Standards modules — choose what this installation should enforce',
      options: STANDARD_MODULES.map((module) => ({
        value: module.id,
        label: module.label,
        hint: module.hint,
      })),
      initialValues: STANDARD_MODULES.filter((module) => module.defaultEnabled).map((module) => module.id),
      required: false,
    });

    if (p.isCancel(selectedModules)) return p.cancel('Cancelled.');

    if (selectedModules.length === 0) {
      p.note(
        'Only the core workflow constitution will be installed. Optional standards can be re-enabled later by reinstalling or editing .aircury/framework.config.json.',
        'No optional standards selected',
      );
    }
  }

  const cwd = process.cwd();
  const isGlobal = scope === 'global';
  const files = isGlobal
    ? getGlobalFiles(selectedTools)
    : getLocalFiles(selectedTools, selectedModules);

  if (files.length === 0) {
    p.outro('Nothing to install.');
    return;
  }

  const conflicts = checkConflicts(files, cwd, isGlobal);
  const existingCount = conflicts.filter((c) => c.exists).length;

  p.log.step(`${files.length} files to install${existingCount > 0 ? `, ${existingCount} already exist` : ''}`);
  for (const { file, exists } of conflicts) {
    const label = isGlobal ? file.path : file.path;
    p.log.info(`${exists ? '~' : '+'} ${label}`);
  }

  const confirmed = await p.confirm({ message: 'Proceed with installation?' });
  if (p.isCancel(confirmed) || !confirmed) return p.cancel('Cancelled.');

  let overwrite: 'skip' | 'overwrite' = 'skip';
  if (existingCount > 0) {
    const choice = await p.select<'skip' | 'overwrite'>({
      message: 'Some files already exist. What do you want to do?',
      options: [
        { value: 'skip', label: 'Skip existing', hint: 'only write new files' },
        { value: 'overwrite', label: 'Overwrite all', hint: 'replace existing files' },
      ],
    });

    if (p.isCancel(choice)) return p.cancel('Cancelled.');
    overwrite = choice;
  }

  const spinner = p.spinner();
  spinner.start('Installing...');

  let written = 0;
  let skipped = 0;

  for (const { file, exists } of conflicts) {
    if (exists && overwrite === 'skip') {
      skipped++;
      continue;
    }
    writeFile(file, cwd, isGlobal);
    written++;
  }

  spinner.stop('Done!');

  if (written > 0) p.log.success(`${written} file${written > 1 ? 's' : ''} written`);
  if (skipped > 0) p.log.warn(`${skipped} file${skipped > 1 ? 's' : ''} skipped (already exist)`);

  p.outro('Aircury AI Framework ready.');
}
