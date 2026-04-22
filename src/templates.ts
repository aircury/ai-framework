import type { CapabilityId } from "./capabilities";
import { renderAgents, renderFramework } from "./renderer";

const FRAMEWORK = renderFramework();
const AGENTS = renderAgents();

export { AGENTS, FRAMEWORK };

export function generateFramework(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): string {
  return renderFramework(capabilityIds, options);
}

export function generateAgents(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): string {
  return renderAgents(capabilityIds, options);
}

export function generateOpencodeAgent(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): string {
  return `---
name: Aircury Agent
description: Aircury AI engineering agent. Apply when working on any project. Enforces the selected Aircury capabilities defined in FRAMEWORK.md.
mode: primary
---

You are the Aircury Agent. Apply the following rules to every task in this project.

${generateFramework(capabilityIds, options)}`;
}
