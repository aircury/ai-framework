import type { StandardModuleId } from "./framework";
import { renderAgents, renderFramework } from "./renderer";

const FRAMEWORK = renderFramework();
const AGENTS = renderAgents();

export { AGENTS, FRAMEWORK };

export function generateFramework(moduleIds?: StandardModuleId[]): string {
  return renderFramework(moduleIds);
}

export function generateAgents(moduleIds?: StandardModuleId[]): string {
  return renderAgents(moduleIds);
}

export function generateOpencodeAgent(moduleIds?: StandardModuleId[]): string {
  return `---
name: Aircury Agent
description: Aircury AI engineering agent. Apply when working on any project. Enforces the selected Aircury workflow and standards modules defined in FRAMEWORK.md.
mode: primary
---

You are the Aircury Agent. Apply the following rules to every task in this project.

${generateFramework(moduleIds)}`;
}
