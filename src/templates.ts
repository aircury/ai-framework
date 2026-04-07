import FRAMEWORK from '../FRAMEWORK.md' with { type: 'text' };
import AGENTS from '../AGENTS.md' with { type: 'text' };

import openSpecApply from '../.agents/skills/open-spec/apply/SKILL.md' with { type: 'text' };
import openSpecComplete from '../.agents/skills/open-spec/complete/SKILL.md' with { type: 'text' };
import openSpecExplore from '../.agents/skills/open-spec/explore/SKILL.md' with { type: 'text' };
import openSpecPropose from '../.agents/skills/open-spec/propose/SKILL.md' with { type: 'text' };

import specKitAnalyze from '../.agents/skills/spec-kit/analyze/SKILL.md' with { type: 'text' };
import specKitChecklist from '../.agents/skills/spec-kit/checklist/SKILL.md' with { type: 'text' };
import specKitClarify from '../.agents/skills/spec-kit/clarify/SKILL.md' with { type: 'text' };
import specKitImplement from '../.agents/skills/spec-kit/implement/SKILL.md' with { type: 'text' };
import specKitPlan from '../.agents/skills/spec-kit/plan/SKILL.md' with { type: 'text' };
import specKitSpecify from '../.agents/skills/spec-kit/specify/SKILL.md' with { type: 'text' };
import specKitTasks from '../.agents/skills/spec-kit/tasks/SKILL.md' with { type: 'text' };

export { FRAMEWORK, AGENTS };

export const skills: Record<string, string> = {
  'open-spec/apply': openSpecApply,
  'open-spec/complete': openSpecComplete,
  'open-spec/explore': openSpecExplore,
  'open-spec/propose': openSpecPropose,
  'spec-kit/analyze': specKitAnalyze,
  'spec-kit/checklist': specKitChecklist,
  'spec-kit/clarify': specKitClarify,
  'spec-kit/implement': specKitImplement,
  'spec-kit/plan': specKitPlan,
  'spec-kit/specify': specKitSpecify,
  'spec-kit/tasks': specKitTasks,
};

export function generateOpencodeAgent(): string {
  return `---
name: Aircury Agent
description: Aircury AI engineering agent. Apply when working on any project. Enforces hexagonal architecture, DDD, TDD, and the meta-agent routing protocol defined in FRAMEWORK.md.
mode: primary
---

You are the Aircury Agent. Apply the following rules to every task in this project.

${FRAMEWORK}`;
}
