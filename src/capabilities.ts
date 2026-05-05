import airsyncMemoryAgents from "../standards/modules/airsync-memory/agents.md" with {
  type: "text",
};
import airsyncMemoryFramework from "../standards/modules/airsync-memory/framework.md" with {
  type: "text",
};
import airsyncMemoryManifest from "../standards/modules/airsync-memory/module.json" with {
  type: "json",
};
import codeStyleAgents from "../standards/modules/code-style/agents.md" with {
  type: "text",
};
import codeStyleFramework from "../standards/modules/code-style/framework.md" with {
  type: "text",
};
import codeStyleManifest from "../standards/modules/code-style/module.json" with {
  type: "json",
};
import dddAgents from "../standards/modules/ddd/agents.md" with {
  type: "text",
};
import dddFramework from "../standards/modules/ddd/framework.md" with {
  type: "text",
};
import dddManifest from "../standards/modules/ddd/module.json" with {
  type: "json",
};
import decisionRecordsAgents from "../standards/modules/decision-records/agents.md" with {
  type: "text",
};
import decisionRecordsFramework from "../standards/modules/decision-records/framework.md" with {
  type: "text",
};
import decisionRecordsManifest from "../standards/modules/decision-records/module.json" with {
  type: "json",
};
import errorHandlingAgents from "../standards/modules/error-handling/agents.md" with {
  type: "text",
};
import errorHandlingFramework from "../standards/modules/error-handling/framework.md" with {
  type: "text",
};
import errorHandlingManifest from "../standards/modules/error-handling/module.json" with {
  type: "json",
};
import frontendAgents from "../standards/modules/frontend/agents.md" with {
  type: "text",
};
import frontendFramework from "../standards/modules/frontend/framework.md" with {
  type: "text",
};
import frontendManifest from "../standards/modules/frontend/module.json" with {
  type: "json",
};
import hexagonalArchitectureAgents from "../standards/modules/hexagonal-architecture/agents.md" with {
  type: "text",
};
import hexagonalArchitectureFramework from "../standards/modules/hexagonal-architecture/framework.md" with {
  type: "text",
};
import hexagonalArchitectureManifest from "../standards/modules/hexagonal-architecture/module.json" with {
  type: "json",
};
import structuredLoggingAgents from "../standards/modules/structured-logging/agents.md" with {
  type: "text",
};
import structuredLoggingFramework from "../standards/modules/structured-logging/framework.md" with {
  type: "text",
};
import structuredLoggingManifest from "../standards/modules/structured-logging/module.json" with {
  type: "json",
};
import testingAgents from "../standards/modules/testing/agents.md" with {
  type: "text",
};
import testingFramework from "../standards/modules/testing/framework.md" with {
  type: "text",
};
import testingManifest from "../standards/modules/testing/module.json" with {
  type: "json",
};
import tokenEfficiencyAgents from "../standards/modules/token-efficiency/agents.md" with {
  type: "text",
};
import tokenEfficiencyFramework from "../standards/modules/token-efficiency/framework.md" with {
  type: "text",
};
import tokenEfficiencyManifest from "../standards/modules/token-efficiency/module.json" with {
  type: "json",
};
import decisionsReadme from "./install-content/specs/decisions/README.md" with {
  type: "text",
};
import frontendWorkflow from "./install-content/specs/ui/frontend-workflow.md" with {
  type: "text",
};
import uiReadme from "./install-content/specs/ui/README.md" with {
  type: "text",
};

export type CapabilityScope = "local" | "global";
export type CapabilityCategory =
  | "workflow"
  | "engineering"
  | "frontend"
  | "communication";

type StandardModuleId =
  | "decision-records"
  | "hexagonal-architecture"
  | "ddd"
  | "code-style"
  | "airsync-memory"
  | "error-handling"
  | "structured-logging"
  | "frontend"
  | "testing"
  | "token-efficiency";

export type CapabilityId =
  | "open-spec"
  | "spec-kit"
  | "airsync"
  | "git"
  | "architecture"
  | "decision-records"
  | "testing"
  | "code-style"
  | "frontend"
  | "token-efficiency"
  | "resilience"
  | "specs"
  | "language";

export interface CapabilitySkill {
  source: string;
  skillName: string;
  scopes: CapabilityScope[];
}

export interface CapabilityFile {
  path: string;
  content: string;
  description: string;
}

export interface CapabilityManifest {
  id: CapabilityId;
  label: string;
  hint: string;
  description: string;
  category: CapabilityCategory;
  defaultSelected: boolean;
  scopes: CapabilityScope[];
  modules?: StandardModuleId[];
  framework?: string;
  agents?: string;
  files?: CapabilityFile[];
  skills?: CapabilitySkill[];
}

export interface CapabilityProfile {
  version: 2;
  capabilities: CapabilityId[];
  language: {
    britishEnglish: boolean;
  };
}

type LegacyModuleId = StandardModuleId | "tdd";

export interface LegacyFrameworkConfig {
  version?: 1;
  modules: LegacyModuleId[];
  language?: {
    britishEnglish?: boolean;
  };
}

interface StandardManifest {
  id: StandardModuleId;
  label: string;
  hint: string;
  description: string;
  defaultEnabled: boolean;
}

interface StandardModule {
  id: StandardModuleId;
  description: string;
  framework: string;
  agents: string;
  files?: CapabilityFile[];
}

function createStandardModule(
  manifest: StandardManifest,
  framework: string,
  agents: string,
  files?: CapabilityFile[],
): StandardModule {
  return {
    id: manifest.id,
    description: manifest.description,
    framework: framework.trim(),
    agents: agents.trim(),
    files,
  };
}

const STANDARD_MODULES: Record<StandardModuleId, StandardModule> = {
  "decision-records": {
    ...createStandardModule(
      decisionRecordsManifest as StandardManifest,
      decisionRecordsFramework,
      decisionRecordsAgents,
      [
        {
          path: "specs/decisions/README.md",
          content: decisionsReadme,
          description: "ADR starter guide",
        },
      ],
    ),
  },
  "hexagonal-architecture": {
    ...createStandardModule(
      hexagonalArchitectureManifest as StandardManifest,
      hexagonalArchitectureFramework,
      hexagonalArchitectureAgents,
    ),
  },
  ddd: {
    ...createStandardModule(
      dddManifest as StandardManifest,
      dddFramework,
      dddAgents,
    ),
  },
  "code-style": {
    ...createStandardModule(
      codeStyleManifest as StandardManifest,
      codeStyleFramework,
      codeStyleAgents,
    ),
  },
  "airsync-memory": {
    ...createStandardModule(
      airsyncMemoryManifest as StandardManifest,
      airsyncMemoryFramework,
      airsyncMemoryAgents,
    ),
  },
  "error-handling": {
    ...createStandardModule(
      errorHandlingManifest as StandardManifest,
      errorHandlingFramework,
      errorHandlingAgents,
    ),
  },
  "structured-logging": {
    ...createStandardModule(
      structuredLoggingManifest as StandardManifest,
      structuredLoggingFramework,
      structuredLoggingAgents,
    ),
  },
  frontend: {
    ...createStandardModule(
      frontendManifest as StandardManifest,
      frontendFramework,
      frontendAgents,
      [
        {
          path: "specs/ui/README.md",
          content: uiReadme,
          description: "Frontend design system starter guide",
        },
        {
          path: "specs/ui/frontend-workflow.md",
          content: frontendWorkflow,
          description: "Frontend workflow reference",
        },
      ],
    ),
  },
  testing: {
    ...createStandardModule(
      testingManifest as StandardManifest,
      testingFramework,
      testingAgents,
    ),
  },
  "token-efficiency": {
    ...createStandardModule(
      tokenEfficiencyManifest as StandardManifest,
      tokenEfficiencyFramework,
      tokenEfficiencyAgents,
    ),
  },
};

function composeModules(
  moduleIds: StandardModuleId[],
): Pick<CapabilityManifest, "modules" | "framework" | "agents" | "files"> {
  const modules = moduleIds.map((moduleId) => STANDARD_MODULES[moduleId]);
  return {
    modules: moduleIds,
    framework: modules.map((module) => module.framework).join("\n\n"),
    agents: modules.map((module) => module.agents).join("\n\n"),
    files: modules.flatMap((module) => module.files ?? []),
  };
}

const CAPABILITY_REGISTRY: Record<CapabilityId, CapabilityManifest> = {
  "open-spec": {
    id: "open-spec",
    label: "OpenSpec",
    hint: "structured propose/apply/complete workflow",
    description:
      "Structured propose/apply/complete workflow for complex changes",
    category: "workflow",
    defaultSelected: true,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "open-spec-propose",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "open-spec-apply",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "open-spec-complete",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "open-spec-explore",
        scopes: ["local", "global"],
      },
    ],
  },
  "spec-kit": {
    id: "spec-kit",
    label: "Spec Kit",
    hint: "formal specification workflow",
    description:
      "Formal specification workflow for feature definition and delivery",
    category: "workflow",
    defaultSelected: true,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-specify",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-clarify",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-plan",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-analyse",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-tasks",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-implement",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-checklist",
        scopes: ["local", "global"],
      },
    ],
  },
  airsync: {
    id: "airsync",
    label: "Airsync",
    hint: "collaborative memory workflow and shared memory rules",
    description: "Collaborative memory workflow with project Airsync rules",
    category: "workflow",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["airsync-memory"]),
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "airsync",
        scopes: ["local", "global"],
      },
    ],
  },
  git: {
    id: "git",
    label: "Git",
    hint: "atomic commit workflow helpers",
    description: "Focused git workflow helpers for atomic commits",
    category: "workflow",
    defaultSelected: true,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "commit-changes",
        scopes: ["local", "global"],
      },
    ],
  },
  architecture: {
    id: "architecture",
    label: "Architecture",
    hint: "DDD, hexagonal architecture, and curated architecture skills",
    description:
      "DDD and hexagonal architecture standards with curated architecture skills",
    category: "engineering",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["hexagonal-architecture", "ddd"]),
    skills: [
      {
        source: "https://github.com/ccheney/robust-skills",
        skillName: "clean-ddd-hexagonal",
        scopes: ["local", "global"],
      },
    ],
  },
  "decision-records": {
    id: "decision-records",
    label: "ADRs",
    hint: "persist architectural intent and supersession history",
    description:
      "Requires agents to capture material architectural and workflow decisions in ADRs under specs/decisions/.",
    category: "engineering",
    defaultSelected: true,
    scopes: ["local"],
    ...composeModules(["decision-records"]),
  },
  testing: {
    id: "testing",
    label: "Testing",
    hint: "unit, integration, UI, and E2E coverage strategy",
    description:
      "Testing standards plus curated Playwright and E2E testing skills",
    category: "engineering",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["testing"]),
    skills: [
      {
        source:
          "https://github.com/currents-dev/playwright-best-practices-skill",
        skillName: "playwright-best-practices",
        scopes: ["local", "global"],
      },
      {
        source: "https://github.com/wshobson/agents",
        skillName: "e2e-testing-patterns",
        scopes: ["local", "global"],
      },
    ],
  },
  "code-style": {
    id: "code-style",
    label: "Code Style",
    hint: "ESLint, Prettier, Biome, Oxlint",
    description:
      "Automatically detects and follows project-specific linting and parsing rules by analysing package.json and config files.",
    category: "engineering",
    defaultSelected: true,
    scopes: ["local"],
    ...composeModules(["code-style"]),
  },
  frontend: {
    id: "frontend",
    label: "Frontend",
    hint: "design tokens, component tree, style guide, and frontend skills",
    description:
      "Frontend standards with layout, experience, and UI generation skills",
    category: "frontend",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["frontend"]),
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "frontend-layout-extractor",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "frontend-experience-extractor",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "frontend-style-extractor",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "frontend-clean-implementation",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "frontend-ui-generator",
        scopes: ["local", "global"],
      },
      {
        source: "https://github.com/vercel-labs/agent-skills",
        skillName: "vercel-react-best-practices",
        scopes: ["local", "global"],
      },
    ],
  },
  "token-efficiency": {
    id: "token-efficiency",
    label: "Token Efficiency",
    hint: "terse default responses through Caveman",
    description:
      "Project token-efficiency rules plus the Caveman skill for terse responses",
    category: "communication",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["token-efficiency"]),
    skills: [
      {
        source: "https://github.com/juliusbrussee/caveman",
        skillName: "caveman",
        scopes: ["local", "global"],
      },
    ],
  },
  resilience: {
    id: "resilience",
    label: "Resilience",
    hint: "error handling, structured logging, and recovery skills",
    description:
      "Error-handling and structured-logging standards with curated resilience skills",
    category: "engineering",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["error-handling", "structured-logging"]),
    skills: [
      {
        source: "https://github.com/wshobson/agents",
        skillName: "error-handling-patterns",
        scopes: ["local", "global"],
      },
      {
        source: "https://github.com/aj-geddes/useful-ai-prompts",
        skillName: "logging-best-practices",
        scopes: ["local", "global"],
      },
    ],
  },
  specs: {
    id: "specs",
    label: "Specs",
    hint: "extract and interpret authoritative specs",
    description:
      "Skills for extracting authoritative specs and designing re-implementations from them",
    category: "workflow",
    defaultSelected: true,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "specs-extractor",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "specs-interpreter",
        scopes: ["local", "global"],
      },
    ],
  },
  language: {
    id: "language",
    label: "Language",
    hint: "UK business English guidance",
    description: "UK business English guidance for project communication",
    category: "communication",
    defaultSelected: false,
    scopes: ["local", "global"],
    skills: [
      {
        source: "https://github.com/jezweb/claude-skills",
        skillName: "uk-business-english",
        scopes: ["local", "global"],
      },
    ],
  },
};

const CAPABILITY_ORDER: CapabilityId[] = [
  "open-spec",
  "spec-kit",
  "airsync",
  "git",
  "architecture",
  "decision-records",
  "testing",
  "code-style",
  "frontend",
  "token-efficiency",
  "resilience",
  "specs",
  "language",
];

const LEGACY_MODULE_CAPABILITY_MAP: Record<LegacyModuleId, CapabilityId> = {
  "decision-records": "decision-records",
  tdd: "testing",
  testing: "testing",
  "hexagonal-architecture": "architecture",
  ddd: "architecture",
  "code-style": "code-style",
  "airsync-memory": "airsync",
  "error-handling": "resilience",
  "structured-logging": "resilience",
  frontend: "frontend",
  "token-efficiency": "token-efficiency",
};

export const CAPABILITIES: CapabilityManifest[] = CAPABILITY_ORDER.map(
  (id) => CAPABILITY_REGISTRY[id],
);

export const DEFAULT_LOCAL_CAPABILITY_IDS: CapabilityId[] = CAPABILITIES.filter(
  (capability) =>
    capability.scopes.includes("local") && capability.defaultSelected,
).map((capability) => capability.id);

export function getCapabilities(scope: CapabilityScope): CapabilityManifest[] {
  return CAPABILITIES.filter((capability) => capability.scopes.includes(scope));
}

export function getCapabilityById(
  capabilityId: CapabilityId,
): CapabilityManifest {
  return CAPABILITY_REGISTRY[capabilityId];
}

export function resolveCapabilityIds(
  capabilityIds: CapabilityId[] = DEFAULT_LOCAL_CAPABILITY_IDS,
): CapabilityId[] {
  const resolved = new Set<CapabilityId>();
  const visit = (capabilityId: CapabilityId) => {
    if (resolved.has(capabilityId)) return;
    resolved.add(capabilityId);
  };

  for (const capabilityId of capabilityIds) {
    visit(capabilityId);
  }

  return CAPABILITY_ORDER.filter((capabilityId) => resolved.has(capabilityId));
}

function isLegacyFrameworkConfig(
  value: CapabilityId[] | LegacyFrameworkConfig | undefined,
): value is LegacyFrameworkConfig {
  return !!value && !Array.isArray(value) && Array.isArray(value.modules);
}

function resolveLegacyModuleCapabilities(
  moduleIds: LegacyModuleId[],
): CapabilityId[] {
  const selected = new Set<CapabilityId>();

  for (const moduleId of moduleIds) {
    selected.add(LEGACY_MODULE_CAPABILITY_MAP[moduleId]);
  }

  return CAPABILITY_ORDER.filter((capabilityId) => selected.has(capabilityId));
}

export function createCapabilityProfile(
  capabilityIds?: CapabilityId[] | LegacyFrameworkConfig,
  options?: { britishEnglish?: boolean },
): CapabilityProfile {
  const britishEnglish =
    options?.britishEnglish ??
    (isLegacyFrameworkConfig(capabilityIds)
      ? (capabilityIds.language?.britishEnglish ?? false)
      : false);
  const selected = new Set(
    isLegacyFrameworkConfig(capabilityIds)
      ? resolveLegacyModuleCapabilities(capabilityIds.modules)
      : resolveCapabilityIds(capabilityIds),
  );

  if (britishEnglish) {
    selected.add("language");
  }

  return {
    version: 2,
    capabilities: CAPABILITY_ORDER.filter((capabilityId) =>
      selected.has(capabilityId),
    ),
    language: {
      britishEnglish,
    },
  };
}

export function getSelectedCapabilities(
  capabilityIds?: CapabilityId[],
  scope?: CapabilityScope,
): CapabilityManifest[] {
  const selected = resolveCapabilityIds(capabilityIds);
  return selected
    .map(getCapabilityById)
    .filter((capability) => !scope || capability.scopes.includes(scope));
}

export function getInitialCapabilityIds(
  scope: CapabilityScope,
  options?: { britishEnglish?: boolean },
): CapabilityId[] {
  const selected = new Set<CapabilityId>(
    getCapabilities(scope)
      .filter((capability) => capability.defaultSelected)
      .map((capability) => capability.id),
  );

  if (options?.britishEnglish) {
    selected.add("language");
  }

  return CAPABILITY_ORDER.filter(
    (capabilityId) =>
      selected.has(capabilityId) &&
      getCapabilityById(capabilityId).scopes.includes(scope),
  );
}

export function getCapabilityFiles(
  capabilityIds: CapabilityId[],
  scope: CapabilityScope,
): CapabilityFile[] {
  const files: CapabilityFile[] = [];
  const seen = new Set<string>();

  for (const capability of getSelectedCapabilities(capabilityIds, scope)) {
    for (const file of capability.files ?? []) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      files.push(file);
    }
  }

  return files;
}

export function getCapabilitySkills(
  capabilityIds: CapabilityId[],
  scope: CapabilityScope,
): CapabilitySkill[] {
  const skills: CapabilitySkill[] = [];
  const seen = new Set<string>();

  for (const capability of getSelectedCapabilities(capabilityIds, scope)) {
    for (const skill of capability.skills ?? []) {
      if (!skill.scopes.includes(scope)) continue;
      const key = `${skill.source}::${skill.skillName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      skills.push(skill);
    }
  }

  return skills;
}
