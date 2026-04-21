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
export type StandardModuleId =
  | "decision-records"
  | "frontend"
  | "hexagonal-architecture"
  | "ddd"
  | "code-style"
  | "airsync-memory"
  | "error-handling"
  | "structured-logging"
  | "testing";

type StandardModuleAlias = "tdd";
export type StandardModuleSelection = StandardModuleId | StandardModuleAlias;

export interface StandardModuleManifest {
  id: StandardModuleId;
  label: string;
  hint: string;
  description: string;
  defaultEnabled: boolean;
}

export interface StandardModule extends StandardModuleManifest {
  framework: string;
  agents: string;
}

export interface FrameworkProfile {
  version: 1;
  modules: StandardModuleId[];
  language?: {
    britishEnglish: boolean;
  };
}

const STANDARD_MODULE_REGISTRY: Record<StandardModuleId, StandardModule> = {
  "decision-records": {
    ...(decisionRecordsManifest as StandardModuleManifest),
    framework: decisionRecordsFramework.trim(),
    agents: decisionRecordsAgents.trim(),
  },
  "hexagonal-architecture": {
    ...(hexagonalArchitectureManifest as StandardModuleManifest),
    framework: hexagonalArchitectureFramework.trim(),
    agents: hexagonalArchitectureAgents.trim(),
  },
  ddd: {
    ...(dddManifest as StandardModuleManifest),
    framework: dddFramework.trim(),
    agents: dddAgents.trim(),
  },
  "code-style": {
    ...(codeStyleManifest as StandardModuleManifest),
    framework: codeStyleFramework.trim(),
    agents: codeStyleAgents.trim(),
  },
  "airsync-memory": {
    ...(airsyncMemoryManifest as StandardModuleManifest),
    framework: airsyncMemoryFramework.trim(),
    agents: airsyncMemoryAgents.trim(),
  },
  "error-handling": {
    ...(errorHandlingManifest as StandardModuleManifest),
    framework: errorHandlingFramework.trim(),
    agents: errorHandlingAgents.trim(),
  },
  frontend: {
    ...(frontendManifest as StandardModuleManifest),
    framework: frontendFramework.trim(),
    agents: frontendAgents.trim(),
  },
  "structured-logging": {
    ...(structuredLoggingManifest as StandardModuleManifest),
    framework: structuredLoggingFramework.trim(),
    agents: structuredLoggingAgents.trim(),
  },
  testing: {
    ...(testingManifest as StandardModuleManifest),
    framework: testingFramework.trim(),
    agents: testingAgents.trim(),
  },
};

export const STANDARD_MODULES: StandardModule[] = Object.values(
  STANDARD_MODULE_REGISTRY,
);

export const DEFAULT_STANDARD_MODULE_IDS: StandardModuleId[] =
  STANDARD_MODULES.filter((module) => module.defaultEnabled).map(
    (module) => module.id,
  );

export function getStandardModuleById(
  moduleId: StandardModuleSelection,
): StandardModule {
  return STANDARD_MODULE_REGISTRY[moduleId === "tdd" ? "testing" : moduleId];
}

export function normaliseModuleIds(
  moduleIds?: StandardModuleSelection[],
): StandardModuleId[] {
  const requested = moduleIds ?? DEFAULT_STANDARD_MODULE_IDS;
  const enabled = new Set(
    requested.map((moduleId) => (moduleId === "tdd" ? "testing" : moduleId)),
  );

  return STANDARD_MODULES.map((module) => module.id).filter((moduleId) =>
    enabled.has(moduleId),
  );
}

export function createFrameworkProfile(
  moduleIds?: StandardModuleSelection[],
  options?: { britishEnglish?: boolean },
): FrameworkProfile {
  return {
    version: 1,
    modules: normaliseModuleIds(moduleIds),
    language: {
      britishEnglish: options?.britishEnglish ?? false,
    },
  };
}

export function getSelectedStandardModules(
  moduleIds?: StandardModuleSelection[],
): StandardModule[] {
  return normaliseModuleIds(moduleIds).map(getStandardModuleById);
}
