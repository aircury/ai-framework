import airsyncMemoryAgents from "../standards/modules/airsync-memory/agents.md" with {
  type: "text",
};
import airsyncMemoryFramework from "../standards/modules/airsync-memory/framework.md" with {
  type: "text",
};
import airsyncMemoryManifest from "../standards/modules/airsync-memory/module.json" with {
  type: "json",
};
import cleanArchitectureAgents from "../standards/modules/clean-architecture/agents.md" with {
  type: "text",
};
import cleanArchitectureFramework from "../standards/modules/clean-architecture/framework.md" with {
  type: "text",
};
import cleanArchitectureManifest from "../standards/modules/clean-architecture/module.json" with {
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
import customArchitectureAgents from "../standards/modules/custom-architecture/agents.md" with {
  type: "text",
};
import customArchitectureFramework from "../standards/modules/custom-architecture/framework.md" with {
  type: "text",
};
import customArchitectureManifest from "../standards/modules/custom-architecture/module.json" with {
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
import dddHexagonalAgents from "../standards/modules/ddd-hexagonal/agents.md" with {
  type: "text",
};
import dddHexagonalFramework from "../standards/modules/ddd-hexagonal/framework.md" with {
  type: "text",
};
import dddHexagonalManifest from "../standards/modules/ddd-hexagonal/module.json" with {
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
import layeredArchitectureAgents from "../standards/modules/layered-architecture/agents.md" with {
  type: "text",
};
import layeredArchitectureFramework from "../standards/modules/layered-architecture/framework.md" with {
  type: "text",
};
import layeredArchitectureManifest from "../standards/modules/layered-architecture/module.json" with {
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
import walkingSkeletonAgents from "../standards/modules/walking-skeleton/agents.md" with {
  type: "text",
};
import walkingSkeletonFramework from "../standards/modules/walking-skeleton/framework.md" with {
  type: "text",
};
import walkingSkeletonManifest from "../standards/modules/walking-skeleton/module.json" with {
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
  | "ddd-hexagonal"
  | "clean-architecture"
  | "layered-architecture"
  | "custom-architecture"
  | "ddd"
  | "code-style"
  | "airsync-memory"
  | "error-handling"
  | "structured-logging"
  | "frontend"
  | "testing"
  | "token-efficiency"
  | "walking-skeleton";

export type CapabilityId =
  | "open-spec"
  | "spec-kit"
  | "walking-skeleton"
  | "airsync"
  | "git"
  | "ddd-hexagonal"
  | "clean-architecture"
  | "layered-architecture"
  | "custom-architecture"
  | "decision-records"
  | "testing"
  | "code-style"
  | "frontend"
  | "token-efficiency"
  | "resilience"
  | "specs"
  | "language"
  | "ask-question"
  | "database"
  | "blind-db-debugging"
  | "db-schema-design"
  | "extract-rule";

type VisibleCapabilityId = Exclude<
  CapabilityId,
  "blind-db-debugging" | "db-schema-design"
>;

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
  id: VisibleCapabilityId;
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
  _notice: string;
  tools?: string[];
  capabilities: CapabilityId[];
  language: {
    britishEnglish: boolean;
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

export const FRAMEWORK_MAINTAINED_NOTICE =
  "This file is maintained by Aircury AI Framework. Do not edit it directly. Add project-specific rules in FRAMEWORK.local.md.";

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
  "ddd-hexagonal": {
    ...createStandardModule(
      dddHexagonalManifest as StandardManifest,
      dddHexagonalFramework,
      dddHexagonalAgents,
    ),
  },
  "clean-architecture": {
    ...createStandardModule(
      cleanArchitectureManifest as StandardManifest,
      cleanArchitectureFramework,
      cleanArchitectureAgents,
    ),
  },
  "layered-architecture": {
    ...createStandardModule(
      layeredArchitectureManifest as StandardManifest,
      layeredArchitectureFramework,
      layeredArchitectureAgents,
    ),
  },
  "custom-architecture": {
    ...createStandardModule(
      customArchitectureManifest as StandardManifest,
      customArchitectureFramework,
      customArchitectureAgents,
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
  "walking-skeleton": {
    ...createStandardModule(
      walkingSkeletonManifest as StandardManifest,
      walkingSkeletonFramework,
      walkingSkeletonAgents,
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

export function getCapabilityDetailPath(capabilityId: CapabilityId): string {
  return `docs/aircury/capabilities/${capabilityId}.md`;
}

export function hasCapabilityDetail(capability: CapabilityManifest): boolean {
  return !!capability.framework?.trim() || !!capability.agents?.trim();
}

function createCapabilityDetailFile(
  capability: CapabilityManifest,
): CapabilityFile | null {
  if (!hasCapabilityDetail(capability)) return null;

  const sections = [
    `# ${capability.label} Capability`,
    `> ${FRAMEWORK_MAINTAINED_NOTICE}`,
    capability.description,
  ];

  if (capability.framework) {
    sections.push("## Framework Rules", capability.framework.trim());
  }

  if (capability.agents) {
    sections.push("## Agent Operating Rules", capability.agents.trim());
  }

  return {
    path: getCapabilityDetailPath(capability.id),
    content: `${sections.join("\n\n")}\n`,
    description: `${capability.label} capability rules`,
  };
}

const CAPABILITY_REGISTRY: Record<VisibleCapabilityId, CapabilityManifest> = {
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
        skillName: "spec-kit-tasks",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "spec-kit-analyse",
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
  "walking-skeleton": {
    id: "walking-skeleton",
    label: "Walking Skeleton",
    hint: "greenfield bootstrap from ADR bundles",
    description:
      "Greenfield bootstrap workflow that plans ADRs, specifies a tiny end-to-end slice, and builds a runnable baseline from the external walking-skeleton skill",
    category: "workflow",
    defaultSelected: false,
    scopes: ["local", "global"],
    ...composeModules(["walking-skeleton"]),
    skills: [
      {
        source: "aircury/walking-skeleton",
        skillName: "walking-skeleton",
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
  "ddd-hexagonal": {
    id: "ddd-hexagonal",
    label: "DDD+Hexagonal",
    hint: "domain modelling, ports and adapters, and curated architecture skills",
    description: "DDD+Hexagonal standards with curated architecture skills",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    ...composeModules(["ddd-hexagonal", "ddd"]),
    skills: [
      {
        source: "https://github.com/ccheney/robust-skills",
        skillName: "clean-ddd-hexagonal",
        scopes: ["local", "global"],
      },
    ],
  },
  "clean-architecture": {
    id: "clean-architecture",
    label: "Clean Architecture",
    hint: "entities, use cases, adapters, and drivers",
    description:
      "Clean Architecture standards that keep business rules independent from frameworks, UI, databases, and external services",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    ...composeModules(["clean-architecture"]),
  },
  "layered-architecture": {
    id: "layered-architecture",
    label: "Layered Architecture",
    hint: "controllers, services, and repositories",
    description:
      "Simple layered standards for projects that need clear separation without Clean or Hexagonal overhead",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    ...composeModules(["layered-architecture"]),
  },
  "custom-architecture": {
    id: "custom-architecture",
    label: "Custom Architecture",
    hint: "discover and document this project's real architecture",
    description:
      "Custom architecture discovery that records project-specific boundaries in FRAMEWORK.local.md",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    ...composeModules(["custom-architecture"]),
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "custom-architecture",
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
    description: "Frontend standards with a self-contained UI workflow skill",
    category: "frontend",
    defaultSelected: true,
    scopes: ["local", "global"],
    ...composeModules(["frontend"]),
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "frontend-ui-workflow",
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
      {
        source: "aircury/ai-framework",
        skillName: "semantic-line-breaks",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "dbml-database-docs",
        scopes: ["local", "global"],
      },
    ],
  },
  language: {
    id: "language",
    label: "Language",
    hint: "British business English guidance",
    description: "British business English guidance for project communication",
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
  "ask-question": {
    id: "ask-question",
    label: "Ask Question",
    hint: "use the IDE AskQuestion tool instead of plain chat for choices",
    description:
      "Requires agents to use the IDE AskQuestion tool when asking the user to choose between options",
    category: "communication",
    defaultSelected: true,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "ask-question",
        scopes: ["local", "global"],
      },
    ],
  },
  database: {
    id: "database",
    label: "Database",
    hint: "schema design and blind debugging workflows",
    description:
      "Database schema design and blind debugging workflows for relational systems",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "blind-db-debugging",
        scopes: ["local", "global"],
      },
      {
        source: "aircury/ai-framework",
        skillName: "db-schema-design",
        scopes: ["local", "global"],
      },
    ],
  },
  "extract-rule": {
    id: "extract-rule",
    label: "Extract Rule",
    hint: "Distil and record coding rules",
    description:
        "Distil reusable engineering rules from code changes and record them in the documentation",
    category: "engineering",
    defaultSelected: false,
    scopes: ["local", "global"],
    skills: [
      {
        source: "aircury/ai-framework",
        skillName: "extract-rule",
        scopes: ["local", "global"],
      },
    ],
  },
};

const CAPABILITY_ORDER: VisibleCapabilityId[] = [
  "open-spec",
  "spec-kit",
  "walking-skeleton",
  "airsync",
  "git",
  "ddd-hexagonal",
  "clean-architecture",
  "layered-architecture",
  "custom-architecture",
  "decision-records",
  "testing",
  "code-style",
  "frontend",
  "token-efficiency",
  "resilience",
  "specs",
  "language",
  "ask-question",
  "database",
  "extract-rule"
];

const LEGACY_CAPABILITY_ALIASES: Partial<
  Record<CapabilityId, VisibleCapabilityId>
> = {
  "blind-db-debugging": "database",
  "db-schema-design": "database",
};

function normalizeCapabilityId(
  capabilityId: CapabilityId,
): VisibleCapabilityId {
  return (
    LEGACY_CAPABILITY_ALIASES[capabilityId] ??
    (capabilityId as VisibleCapabilityId)
  );
}

const EXCLUSIVE_ARCHITECTURE_CAPABILITIES: CapabilityId[] = [
  "ddd-hexagonal",
  "clean-architecture",
  "layered-architecture",
  "custom-architecture",
];

function normalizeExclusiveArchitectures(
  capabilityIds: CapabilityId[],
): CapabilityId[] {
  const selectedArchitectures = capabilityIds.filter((capabilityId) =>
    EXCLUSIVE_ARCHITECTURE_CAPABILITIES.includes(capabilityId),
  );

  if (selectedArchitectures.length <= 1) return capabilityIds;

  const selectedArchitecture = selectedArchitectures.at(-1);
  return capabilityIds.filter(
    (capabilityId) =>
      !EXCLUSIVE_ARCHITECTURE_CAPABILITIES.includes(capabilityId) ||
      capabilityId === selectedArchitecture,
  );
}

export const CAPABILITIES: CapabilityManifest[] = CAPABILITY_ORDER.map(
  (id) => CAPABILITY_REGISTRY[id],
);

export const DEFAULT_LOCAL_CAPABILITY_IDS: VisibleCapabilityId[] =
  CAPABILITIES.filter(
    (capability) =>
      capability.scopes.includes("local") && capability.defaultSelected,
  ).map((capability) => capability.id);

export function getCapabilities(scope: CapabilityScope): CapabilityManifest[] {
  return CAPABILITIES.filter((capability) => capability.scopes.includes(scope));
}

export function getCapabilityById(
  capabilityId: CapabilityId,
): CapabilityManifest {
  return CAPABILITY_REGISTRY[normalizeCapabilityId(capabilityId)];
}

export function resolveCapabilityIds(
  capabilityIds: CapabilityId[] = DEFAULT_LOCAL_CAPABILITY_IDS,
): VisibleCapabilityId[] {
  const resolved = new Set<VisibleCapabilityId>();
  const visit = (capabilityId: CapabilityId) => {
    const normalizedCapabilityId = normalizeCapabilityId(capabilityId);
    if (resolved.has(normalizedCapabilityId)) return;
    resolved.add(normalizedCapabilityId);
  };

  for (const capabilityId of normalizeExclusiveArchitectures(capabilityIds)) {
    visit(capabilityId);
  }

  return CAPABILITY_ORDER.filter((capabilityId) => resolved.has(capabilityId));
}

export function createCapabilityProfile(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean; tools?: string[] },
): CapabilityProfile {
  const britishEnglish = options?.britishEnglish ?? false;
  const selected = new Set<VisibleCapabilityId>(
    resolveCapabilityIds(capabilityIds),
  );

  if (britishEnglish) {
    selected.add("language");
  }

  return {
    version: 2,
    _notice: FRAMEWORK_MAINTAINED_NOTICE,
    tools: options?.tools,
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
  options?: {
    britishEnglish?: boolean;
    installedCapabilityIds?: CapabilityId[];
  },
): CapabilityId[] {
  const initialCapabilityIds =
    options?.installedCapabilityIds ??
    getCapabilities(scope)
      .filter((capability) => capability.defaultSelected)
      .map((capability) => capability.id);
  const selected = new Set<CapabilityId>(
    resolveCapabilityIds(initialCapabilityIds),
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
    const detailFile = createCapabilityDetailFile(capability);
    if (detailFile && !seen.has(detailFile.path)) {
      seen.add(detailFile.path);
      files.push(detailFile);
    }

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
