export type SkillGroupKind = "aircury" | "external";
export type SkillScope = "local" | "global";

import type { StandardModuleId } from "./framework";

export interface SkillGroup {
  id: string;
  label: string;
  description: string;
  kind: SkillGroupKind;
  defaultSelected: boolean;
  scopes: SkillScope[];
}

export interface SkillDefinition {
  id: string;
  label: string;
  description: string;
  source: string;
  skillName: string;
  groupId: string;
  scopes: SkillScope[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "open-spec",
    label: "OpenSpec",
    description:
      "Structured propose/apply/complete workflow for complex changes",
    kind: "aircury",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit",
    label: "Spec Kit",
    description:
      "Formal specification workflow for feature definition and delivery",
    kind: "aircury",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "airsync",
    label: "Airsync",
    description: "Collaborative memory workflow for reusable team knowledge",
    kind: "aircury",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "git",
    label: "Git",
    description: "Focused git workflow helpers for atomic commits",
    kind: "aircury",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "resilience",
    label: "Resilience",
    description:
      "Curated external guidance for error handling and structured logging",
    kind: "external",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "testing",
    label: "Testing",
    description:
      "Curated testing guidance covering frontend tooling and end-to-end patterns",
    kind: "external",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "architecture",
    label: "Architecture",
    description:
      "Curated external architecture guidance for DDD and hexagonal design",
    kind: "external",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "language",
    label: "Language",
    description: "UK business English guidance for project communication",
    kind: "external",
    defaultSelected: false,
    scopes: ["local", "global"],
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Skills for UI layout extraction and implementation",
    kind: "aircury",
    defaultSelected: false,
    scopes: ["local", "global"],
  },
  {
    id: "specs",
    label: "Specs",
    description:
      "Skills for extracting authoritative specs and designing re-implementations from them",
    kind: "aircury",
    defaultSelected: true,
    scopes: ["local", "global"],
  },
  {
    id: "token-efficiency",
    label: "Token Efficiency",
    description:
      "Caveman terse-response skill for token-efficient project sessions",
    kind: "external",
    defaultSelected: false,
    scopes: ["local", "global"],
  },
];

export const SKILLS: SkillDefinition[] = [
  {
    id: "open-spec-propose",
    label: "OpenSpec Propose",
    description: "Create a structured proposal with working artifacts",
    source: "aircury/ai-framework",
    skillName: "open-spec-propose",
    groupId: "open-spec",
    scopes: ["local", "global"],
  },
  {
    id: "open-spec-apply",
    label: "OpenSpec Apply",
    description: "Implement a scoped change from working artifacts",
    source: "aircury/ai-framework",
    skillName: "open-spec-apply",
    groupId: "open-spec",
    scopes: ["local", "global"],
  },
  {
    id: "open-spec-complete",
    label: "OpenSpec Complete",
    description: "Sync canonical specs and finish an OpenSpec change",
    source: "aircury/ai-framework",
    skillName: "open-spec-complete",
    groupId: "open-spec",
    scopes: ["local", "global"],
  },
  {
    id: "open-spec-explore",
    label: "OpenSpec Explore",
    description: "Investigate unclear problems before proposing a change",
    source: "aircury/ai-framework",
    skillName: "open-spec-explore",
    groupId: "open-spec",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-specify",
    label: "Spec Kit Specify",
    description: "Write a formal feature specification",
    source: "aircury/ai-framework",
    skillName: "spec-kit-specify",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-clarify",
    label: "Spec Kit Clarify",
    description: "Resolve ambiguity in an in-progress specification",
    source: "aircury/ai-framework",
    skillName: "spec-kit-clarify",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-plan",
    label: "Spec Kit Plan",
    description: "Translate approved specs into a technical plan",
    source: "aircury/ai-framework",
    skillName: "spec-kit-plan",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-analyse",
    label: "Spec Kit Analyse",
    description: "Review specs for completeness and delivery risk",
    source: "aircury/ai-framework",
    skillName: "spec-kit-analyse",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-tasks",
    label: "Spec Kit Tasks",
    description: "Break the technical plan into execution tasks",
    source: "aircury/ai-framework",
    skillName: "spec-kit-tasks",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-implement",
    label: "Spec Kit Implement",
    description: "Execute a task list from an approved plan",
    source: "aircury/ai-framework",
    skillName: "spec-kit-implement",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "spec-kit-checklist",
    label: "Spec Kit Checklist",
    description: "Run final verification against the approved spec",
    source: "aircury/ai-framework",
    skillName: "spec-kit-checklist",
    groupId: "spec-kit",
    scopes: ["local", "global"],
  },
  {
    id: "airsync",
    label: "Airsync",
    description: "Capture and publish reusable team memory",
    source: "aircury/ai-framework",
    skillName: "airsync",
    groupId: "airsync",
    scopes: ["local", "global"],
  },
  {
    id: "commit-changes",
    label: "Commit Changes",
    description: "Create atomic, semantic git commits from workspace changes",
    source: "aircury/ai-framework",
    skillName: "commit-changes",
    groupId: "git",
    scopes: ["local", "global"],
  },
  {
    id: "e2e-testing-patterns",
    label: "E2E Testing Patterns",
    description:
      "Use stable end-to-end testing patterns for critical journeys and CI execution",
    source: "https://github.com/wshobson/agents",
    skillName: "e2e-testing-patterns",
    groupId: "testing",
    scopes: ["local", "global"],
  },
  {
    id: "playwright-best-practices",
    label: "Playwright Best Practices",
    description:
      "Apply Playwright-specific patterns for resilient browser automation and debugging",
    source: "https://github.com/currents-dev/playwright-best-practices-skill",
    skillName: "playwright-best-practices",
    groupId: "testing",
    scopes: ["local", "global"],
  },
  {
    id: "clean-ddd-hexagonal",
    label: "Clean DDD Hexagonal",
    description:
      "Apply clean DDD and hexagonal architecture boundaries to implementation work",
    source: "https://github.com/ccheney/robust-skills",
    skillName: "clean-ddd-hexagonal",
    groupId: "architecture",
    scopes: ["local", "global"],
  },
  {
    id: "error-handling-patterns",
    label: "Error Handling Patterns",
    description:
      "Apply reusable error classification, response, and recovery patterns",
    source: "https://github.com/wshobson/agents",
    skillName: "error-handling-patterns",
    groupId: "resilience",
    scopes: ["local", "global"],
  },
  {
    id: "logging-best-practices",
    label: "Logging Best Practices",
    description:
      "Apply structured logging patterns with rich contextual diagnostic events",
    source: "https://github.com/aj-geddes/useful-ai-prompts",
    skillName: "logging-best-practices",
    groupId: "resilience",
    scopes: ["local", "global"],
  },
  {
    id: "uk-business-english",
    label: "UK Business English",
    description:
      "Encourage British English spelling and business writing style",
    source: "https://github.com/jezweb/claude-skills",
    skillName: "uk-business-english",
    groupId: "language",
    scopes: ["local", "global"],
  },
  {
    id: "frontend-layout-extractor",
    label: "Frontend Layout Extractor",
    description:
      "Extract structural layout and behavior from frontend code (no styles)",
    source: "aircury/ai-framework",
    skillName: "frontend-layout-extractor",
    groupId: "frontend",
    scopes: ["local", "global"],
  },
  {
    id: "frontend-experience-extractor",
    label: "Frontend Experience Extractor",
    description:
      "Extract behavioral UX, flows, and micro-interactions from frontend code",
    source: "aircury/ai-framework",
    skillName: "frontend-experience-extractor",
    groupId: "frontend",
    scopes: ["local", "global"],
  },
  {
    id: "frontend-ui-generator",
    label: "Frontend UI Generator",
    description: "Generate UI implementation from layout and style guide",
    source: "aircury/ai-framework",
    skillName: "frontend-ui-generator",
    groupId: "frontend",
    scopes: ["local", "global"],
  },
  {
    id: "specs-extractor",
    label: "Specs Extractor",
    description:
      "Extract exact, behavior-first specifications from an existing codebase",
    source: "aircury/ai-framework",
    skillName: "specs-extractor",
    groupId: "specs",
    scopes: ["local", "global"],
  },
  {
    id: "specs-interpreter",
    label: "Specs Interpreter",
    description:
      "Interpret authoritative specs and help design a new implementation collaboratively",
    source: "aircury/ai-framework",
    skillName: "specs-interpreter",
    groupId: "specs",
    scopes: ["local", "global"],
  },
  {
    id: "caveman",
    label: "Caveman",
    description:
      "Respond tersely by default while preserving technical accuracy",
    source: "https://github.com/juliusbrussee/caveman",
    skillName: "caveman",
    groupId: "token-efficiency",
    scopes: ["local", "global"],
  },
];

export function getSkillGroups(
  scope: SkillScope,
  kind?: SkillGroupKind,
): SkillGroup[] {
  return SKILL_GROUPS.filter((group) => {
    if (!group.scopes.includes(scope)) return false;
    if (kind && group.kind !== kind) return false;
    return true;
  });
}

export function getDefaultSkillGroupIds(scope: SkillScope): string[] {
  return getSkillGroups(scope)
    .filter((group) => group.defaultSelected)
    .map((group) => group.id);
}

export function getInitialSkillGroupIds(
  scope: SkillScope,
  options?: { britishEnglish?: boolean; moduleIds?: StandardModuleId[] },
): string[] {
  let selected = getDefaultSkillGroupIds(scope);

  if (options?.britishEnglish && !selected.includes("language")) {
    selected = [...selected, "language"];
  }

  if (
    options?.moduleIds?.includes("frontend") &&
    !selected.includes("frontend")
  ) {
    selected = [...selected, "frontend"];
  }

  if (
    options?.moduleIds?.includes("token-efficiency") &&
    !selected.includes("token-efficiency")
  ) {
    selected = [...selected, "token-efficiency"];
  }

  return selected;
}

export function expandSkillGroups(
  groupIds: string[],
  scope: SkillScope,
): SkillDefinition[] {
  const groupSet = new Set(groupIds);
  const seen = new Set<string>();
  const expanded: SkillDefinition[] = [];

  for (const skill of SKILLS) {
    if (!groupSet.has(skill.groupId)) continue;
    if (!skill.scopes.includes(scope)) continue;
    if (seen.has(skill.id)) continue;
    seen.add(skill.id);
    expanded.push(skill);
  }

  return expanded;
}
