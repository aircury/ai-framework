#!/usr/bin/env bun
/**
 * Auto-generates src/skills.generated.ts from all SKILL.md files in .agents/skills/.
 * Run via: bun run generate:skills
 * Runs automatically as part of the build.
 */

import { Glob } from 'bun';
import { writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dir, '..');
const skillsDir = join(root, 'skills');
const outFile = join(root, 'src', 'skills.generated.ts');

const glob = new Glob('**/SKILL.md');
const entries: Array<{ name: string; varName: string; relativePath: string }> = [];

for (const file of glob.scanSync(skillsDir)) {
  const name = file.replace('/SKILL.md', '');
  const varName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const relativePath = relative(join(root, 'src'), join(skillsDir, file)).replace(/\\/g, '/');
  entries.push({ name, varName, relativePath });
}

entries.sort((a, b) => a.name.localeCompare(b.name));

const imports = entries.map((e) => `import ${e.varName} from '${e.relativePath}' with { type: 'text' };`).join('\n');
const record = entries.map((e) => `  '${e.name}': ${e.varName},`).join('\n');

const output = `// AUTO-GENERATED — do not edit manually. Run \`bun run generate:skills\` to update.
${imports}

export const skills: Record<string, string> = {
${record}
};
`;

writeFileSync(outFile, output, 'utf-8');
console.log(`Generated ${outFile} with ${entries.length} skills:`);
for (const e of entries) console.log(`  - ${e.name}`);
