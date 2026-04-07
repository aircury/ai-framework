import FRAMEWORK from '../FRAMEWORK.md' with { type: 'text' };
import AGENTS from '../AGENTS.md' with { type: 'text' };
import { skills } from './skills.generated';

export { FRAMEWORK, AGENTS, skills };

export function generateOpencodeAgent(): string {
  return `---
name: Aircury Agent
description: Aircury AI engineering agent. Apply when working on any project. Enforces hexagonal architecture, DDD, TDD, and the meta-agent routing protocol defined in FRAMEWORK.md.
mode: primary
---

You are the Aircury Agent. Apply the following rules to every task in this project.

${FRAMEWORK}`;
}
