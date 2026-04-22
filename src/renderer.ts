import Handlebars from "handlebars";
import agentsTemplateSource from "../templates/agents.md.hbs" with {
  type: "text",
};
import frameworkTemplateSource from "../templates/framework.md.hbs" with {
  type: "text",
};
import type { CapabilityId, CapabilityManifest } from "./capabilities";
import { getSelectedCapabilities } from "./capabilities";

interface RendererViewModel {
  installedModules: Pick<CapabilityManifest, "id" | "description">[];
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

function createViewModel(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): RendererViewModel {
  const selectedCapabilities = getSelectedCapabilities(capabilityIds, "local");
  const selectedIds = new Set(
    selectedCapabilities.map((capability) => capability.id),
  );

  return {
    installedModules: selectedCapabilities.map(({ id, description }) => ({
      id,
      description,
    })),
    frameworkSections: selectedCapabilities
      .map((capability) => capability.framework)
      .filter(Boolean),
    agentRules: selectedCapabilities
      .map((capability) => capability.agents)
      .filter(Boolean),
    includesDecisionRecords: selectedIds.has("decision-records"),
    includesTesting: selectedIds.has("testing"),
    includesArchitecture:
      selectedIds.has("hexagonal-architecture") || selectedIds.has("ddd"),
    includesCodeStyle: selectedIds.has("code-style"),
    includesAirsyncMemory: selectedIds.has("airsync-memory"),
    includesErrorHandling: selectedIds.has("error-handling"),
    includesStructuredLogging: selectedIds.has("structured-logging"),
    includesFrontend: selectedIds.has("frontend"),
    includesTokenEfficiency: selectedIds.has("token-efficiency"),
    enforceBritishEnglish: options?.britishEnglish ?? false,
  };
}

function trimRenderedDocument(content: string): string {
  return `${content.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderFramework(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderFrameworkTemplate(createViewModel(capabilityIds, options)),
  );
}

export function renderAgents(
  capabilityIds?: CapabilityId[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderAgentsTemplate(createViewModel(capabilityIds, options)),
  );
}
