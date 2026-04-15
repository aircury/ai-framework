import dddAgents from '../standards/modules/ddd/agents.md' with { type: 'text' };
import dddFramework from '../standards/modules/ddd/framework.md' with { type: 'text' };
import dddManifest from '../standards/modules/ddd/module.json' with { type: 'json' };
import decisionRecordsAgents from '../standards/modules/decision-records/agents.md' with { type: 'text' };
import decisionRecordsFramework from '../standards/modules/decision-records/framework.md' with { type: 'text' };
import decisionRecordsManifest from '../standards/modules/decision-records/module.json' with { type: 'json' };
import hexagonalArchitectureAgents from '../standards/modules/hexagonal-architecture/agents.md' with { type: 'text' };
import hexagonalArchitectureFramework from '../standards/modules/hexagonal-architecture/framework.md' with { type: 'text' };
import hexagonalArchitectureManifest from '../standards/modules/hexagonal-architecture/module.json' with { type: 'json' };
import tddAgents from '../standards/modules/tdd/agents.md' with { type: 'text' };
import tddFramework from '../standards/modules/tdd/framework.md' with { type: 'text' };
import tddManifest from '../standards/modules/tdd/module.json' with { type: 'json' };
import codeStyleAgents from '../standards/modules/code-style/agents.md' with { type: 'text' };
import codeStyleFramework from '../standards/modules/code-style/framework.md' with { type: 'text' };
import codeStyleManifest from '../standards/modules/code-style/module.json' with { type: 'json' };

export type StandardModuleId =
  | 'decision-records'
  | 'tdd'
  | 'hexagonal-architecture'
  | 'ddd'
  | 'code-style';

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
}

const STANDARD_MODULE_REGISTRY: Record<StandardModuleId, StandardModule> = {
  'decision-records': {
    ...(decisionRecordsManifest as StandardModuleManifest),
    framework: decisionRecordsFramework.trim(),
    agents: decisionRecordsAgents.trim(),
  },
  tdd: {
    ...(tddManifest as StandardModuleManifest),
    framework: tddFramework.trim(),
    agents: tddAgents.trim(),
  },
  'hexagonal-architecture': {
    ...(hexagonalArchitectureManifest as StandardModuleManifest),
    framework: hexagonalArchitectureFramework.trim(),
    agents: hexagonalArchitectureAgents.trim(),
  },
  ddd: {
    ...(dddManifest as StandardModuleManifest),
    framework: dddFramework.trim(),
    agents: dddAgents.trim(),
  },
  'code-style': {
    ...(codeStyleManifest as StandardModuleManifest),
    framework: codeStyleFramework.trim(),
    agents: codeStyleAgents.trim(),
  },
};

export const STANDARD_MODULES: StandardModule[] = Object.values(STANDARD_MODULE_REGISTRY);

export const DEFAULT_STANDARD_MODULE_IDS: StandardModuleId[] = STANDARD_MODULES
  .filter((module) => module.defaultEnabled)
  .map((module) => module.id);

export function getStandardModuleById(moduleId: StandardModuleId): StandardModule {
  return STANDARD_MODULE_REGISTRY[moduleId];
}

export function normalizeModuleIds(moduleIds?: StandardModuleId[]): StandardModuleId[] {
  const requested = moduleIds ?? DEFAULT_STANDARD_MODULE_IDS;
  const enabled = new Set(requested);

  return STANDARD_MODULES
    .map((module) => module.id)
    .filter((moduleId) => enabled.has(moduleId));
}

export function createFrameworkProfile(moduleIds?: StandardModuleId[]): FrameworkProfile {
  return {
    version: 1,
    modules: normalizeModuleIds(moduleIds),
  };
}

export function getSelectedStandardModules(moduleIds?: StandardModuleId[]): StandardModule[] {
  return normalizeModuleIds(moduleIds).map(getStandardModuleById);
}
