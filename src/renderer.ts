import Handlebars from "handlebars";
import agentsTemplateSource from "../templates/agents.md.hbs" with {
  type: "text",
};
import frameworkTemplateSource from "../templates/framework.md.hbs" with {
  type: "text",
};
import type { CapabilityId } from "./capabilities";
import {
  getCapabilityDetailPath,
  getSelectedCapabilities,
  hasCapabilityDetail,
} from "./capabilities";

interface InstalledCapabilityView {
  id: CapabilityId;
  description: string;
  detailPath?: string;
}

interface RendererViewModel {
  installedCapabilities: InstalledCapabilityView[];
  includesCapabilityDetails: boolean;
  includesDecisionRecords: boolean;
  includesTesting: boolean;
  includesDddHexagonalArchitecture: boolean;
  includesCleanArchitecture: boolean;
  includesLayeredArchitecture: boolean;
  includesCustomArchitecture: boolean;
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
  const selectedModuleIds = new Set(
    selectedCapabilities.flatMap((capability) => capability.modules ?? []),
  );

  return {
    installedCapabilities: selectedCapabilities.map((capability) => ({
      id: capability.id,
      description: capability.description,
      detailPath: hasCapabilityDetail(capability)
        ? getCapabilityDetailPath(capability.id)
        : undefined,
    })),
    includesCapabilityDetails: selectedCapabilities.some(hasCapabilityDetail),
    includesDecisionRecords: selectedIds.has("decision-records"),
    includesTesting: selectedIds.has("testing"),
    includesDddHexagonalArchitecture: selectedIds.has("ddd-hexagonal"),
    includesCleanArchitecture: selectedIds.has("clean-architecture"),
    includesLayeredArchitecture: selectedIds.has("layered-architecture"),
    includesCustomArchitecture: selectedIds.has("custom-architecture"),
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
