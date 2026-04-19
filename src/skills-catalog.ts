export type SkillGroupKind = "aircury" | "external";
export type SkillScope = "local" | "global";

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
    id: "architecture",
    label: "Architecture",
    description:
      "Curated external architecture guidance for DDD and hexagonal design",
    kind: "external",
    defaultSelected: true,
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
    id: "spec-kit-analyze",
    label: "Spec Kit Analyze",
    description: "Review specs for completeness and delivery risk",
    source: "aircury/ai-framework",
    skillName: "spec-kit-analyze",
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
    id: "clean-ddd-hexagonal",
    label: "Clean DDD Hexagonal",
    description:
      "Apply clean DDD and hexagonal architecture boundaries to implementation work",
    source: "https://github.com/ccheney/robust-skills",
    skillName: "clean-ddd-hexagonal",
    groupId: "architecture",
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
