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

type ContentCapabilityId =
  | "decision-records"
  | "frontend"
  | "hexagonal-architecture"
  | "ddd"
  | "code-style"
  | "airsync-memory"
  | "error-handling"
  | "structured-logging"
  | "testing"
  | "token-efficiency";

type WorkflowCapabilityId =
  | "open-spec"
  | "spec-kit"
  | "airsync"
  | "git"
  | "architecture"
  | "resilience"
  | "specs"
  | "language";

export type CapabilityId = ContentCapabilityId | WorkflowCapabilityId;

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
  framework?: string;
  agents?: string;
  files?: CapabilityFile[];
  skills?: CapabilitySkill[];
  implies?: CapabilityId[];
}

export interface CapabilityProfile {
  version: 2;
  capabilities: CapabilityId[];
  language: {
    britishEnglish: boolean;
  };
}

interface ContentManifest {
  id: ContentCapabilityId;
  label: string;
  hint: string;
  description: string;
  defaultEnabled: boolean;
}

function fromContentManifest(
  manifest: ContentManifest,
  category: CapabilityCategory,
  scopes: CapabilityScope[],
): Pick<
  CapabilityManifest,
  | "id"
  | "label"
  | "hint"
  | "description"
  | "defaultSelected"
  | "category"
  | "scopes"
> {
  return {
    id: manifest.id,
    label: manifest.label,
    hint: manifest.hint,
    description: manifest.description,
    defaultSelected: manifest.defaultEnabled,
    category,
    scopes,
  };
}

const CONTENT_CAPABILITIES: Record<ContentCapabilityId, CapabilityManifest> = {
  "decision-records": {
    ...fromContentManifest(
      decisionRecordsManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: decisionRecordsFramework.trim(),
    agents: decisionRecordsAgents.trim(),
    files: [
      {
        path: "specs/decisions/README.md",
        content: decisionsReadme,
        description: "ADR starter guide",
      },
    ],
  },
  "hexagonal-architecture": {
    ...fromContentManifest(
      hexagonalArchitectureManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: hexagonalArchitectureFramework.trim(),
    agents: hexagonalArchitectureAgents.trim(),
  },
  ddd: {
    ...fromContentManifest(dddManifest as ContentManifest, "engineering", [
      "local",
    ]),
    framework: dddFramework.trim(),
    agents: dddAgents.trim(),
  },
  "code-style": {
    ...fromContentManifest(
      codeStyleManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: codeStyleFramework.trim(),
    agents: codeStyleAgents.trim(),
  },
  "airsync-memory": {
    ...fromContentManifest(
      airsyncMemoryManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: airsyncMemoryFramework.trim(),
    agents: airsyncMemoryAgents.trim(),
  },
  "error-handling": {
    ...fromContentManifest(
      errorHandlingManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: errorHandlingFramework.trim(),
    agents: errorHandlingAgents.trim(),
  },
  frontend: {
    ...fromContentManifest(frontendManifest as ContentManifest, "frontend", [
      "local",
      "global",
    ]),
    framework: frontendFramework.trim(),
    agents: frontendAgents.trim(),
    files: [
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
        skillName: "frontend-ui-generator",
        scopes: ["local", "global"],
      },
    ],
  },
  "structured-logging": {
    ...fromContentManifest(
      structuredLoggingManifest as ContentManifest,
      "engineering",
      ["local"],
    ),
    framework: structuredLoggingFramework.trim(),
    agents: structuredLoggingAgents.trim(),
  },
  testing: {
    ...fromContentManifest(testingManifest as ContentManifest, "engineering", [
      "local",
    ]),
    framework: testingFramework.trim(),
    agents: testingAgents.trim(),
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
  "token-efficiency": {
    ...fromContentManifest(
      tokenEfficiencyManifest as ContentManifest,
      "communication",
      ["local"],
    ),
    framework: tokenEfficiencyFramework.trim(),
    agents: tokenEfficiencyAgents.trim(),
    skills: [
      {
        source: "https://github.com/juliusbrussee/caveman",
        skillName: "caveman",
        scopes: ["local", "global"],
      },
    ],
  },
};

const WORKFLOW_CAPABILITIES: Record<WorkflowCapabilityId, CapabilityManifest> =
  {
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
      hint: "collaborative memory workflow",
      description: "Collaborative memory workflow for reusable team knowledge",
      category: "workflow",
      defaultSelected: true,
      scopes: ["local", "global"],
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
      hint: "curated DDD and hexagonal architecture skills",
      description:
        "Curated external architecture guidance for DDD and hexagonal design",
      category: "engineering",
      defaultSelected: true,
      scopes: ["local", "global"],
      skills: [
        {
          source: "https://github.com/ccheney/robust-skills",
          skillName: "clean-ddd-hexagonal",
          scopes: ["local", "global"],
        },
      ],
    },
    resilience: {
      id: "resilience",
      label: "Resilience",
      hint: "curated logging and recovery skills",
      description:
        "Curated external guidance for error handling and structured logging",
      category: "engineering",
      defaultSelected: true,
      scopes: ["local", "global"],
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
  "hexagonal-architecture",
  "ddd",
  "code-style",
  "airsync-memory",
  "error-handling",
  "structured-logging",
  "frontend",
  "token-efficiency",
  "resilience",
  "specs",
  "language",
];

const CAPABILITY_REGISTRY: Record<CapabilityId, CapabilityManifest> = {
  ...CONTENT_CAPABILITIES,
  ...WORKFLOW_CAPABILITIES,
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
    const capability = getCapabilityById(capabilityId);
    resolved.add(capabilityId);
    for (const impliedId of capability.implies ?? []) {
      visit(impliedId);
    }
  };

  for (const capabilityId of capabilityIds) {
    visit(capabilityId);
  }

  return CAPABILITY_ORDER.filter((capabilityId) => resolved.has(capabilityId));
}

export function createCapabilityProfile(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): CapabilityProfile {
  const selected = new Set(resolveCapabilityIds(capabilityIds));
  if (options?.britishEnglish) {
    selected.add("language");
  }

  return {
    version: 2,
    capabilities: CAPABILITY_ORDER.filter((capabilityId) =>
      selected.has(capabilityId),
    ),
    language: {
      britishEnglish: options?.britishEnglish ?? false,
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
