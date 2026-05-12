import Handlebars from "handlebars";
import agentsTemplateSource from "../templates/agents.md.hbs" with {
  type: "text",
};
import frameworkTemplateSource from "../templates/framework.md.hbs" with {
  type: "text",
};
import type { CapabilityInputId, CapabilityManifest } from "./capabilities";
import { getSelectedCapabilities } from "./capabilities";

interface RendererViewModel {
  installedCapabilities: Pick<CapabilityManifest, "id" | "description">[];
  frameworkSections: string[];
  agentRules: string[];
  includesDecisionRecords: boolean;
  includesTesting: boolean;
  includesArchitecture: boolean;
  includesCodeStyle: boolean;
  includesAirsyncMemory: boolean;
  includesErrorHandling: boolean;
  includesStructuredLogging: boolean;
  includesFrontend: boolean;
  includesTokenEfficiency: boolean;
  enforceBritishEnglish: boolean;
}

const renderFrameworkTemplate = Handlebars.compile(frameworkTemplateSource, {
  noEscape: true,
});
const renderAgentsTemplate = Handlebars.compile(agentsTemplateSource, {
  noEscape: true,
});

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function createViewModel(
  capabilityIds?: CapabilityInputId[],
  options?: { britishEnglish?: boolean },
): RendererViewModel {
  const selectedCapabilities = getSelectedCapabilities(capabilityIds, "local");
  const selectedIds = new Set(
    selectedCapabilities.map((capability) => capability.id),
  );
  const selectedModuleIds = new Set(
    selectedCapabilities.flatMap((capability) => capability.modules ?? []),
  );

  return {
    installedCapabilities: selectedCapabilities.map(({ id, description }) => ({
      id,
      description,
    })),
    frameworkSections: selectedCapabilities
      .map((capability) => capability.framework)
      .filter(isString),
    agentRules: selectedCapabilities
      .map((capability) => capability.agents)
      .filter(isString),
    includesDecisionRecords: selectedIds.has("decision-records"),
    includesTesting: selectedIds.has("testing"),
    includesArchitecture: selectedIds.has("ddd-hexagonal"),
    includesCodeStyle: selectedIds.has("code-style"),
    includesAirsyncMemory: selectedModuleIds.has("airsync-memory"),
    includesErrorHandling: selectedModuleIds.has("error-handling"),
    includesStructuredLogging: selectedModuleIds.has("structured-logging"),
    includesFrontend: selectedIds.has("frontend"),
    includesTokenEfficiency: selectedIds.has("token-efficiency"),
    enforceBritishEnglish: options?.britishEnglish ?? false,
  };
}

function trimRenderedDocument(content: string): string {
  return `${content.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderFramework(
  capabilityIds?: CapabilityInputId[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderFrameworkTemplate(createViewModel(capabilityIds, options)),
  );
}

export function renderAgents(
  capabilityIds?: CapabilityInputId[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderAgentsTemplate(createViewModel(capabilityIds, options)),
  );
}
