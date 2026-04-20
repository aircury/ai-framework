import Handlebars from "handlebars";
import agentsTemplateSource from "../templates/agents.md.hbs" with {
  type: "text",
};
import frameworkTemplateSource from "../templates/framework.md.hbs" with {
  type: "text",
};
import type { StandardModule, StandardModuleSelection } from "./framework";
import { getSelectedStandardModules } from "./framework";

interface RendererViewModel {
  installedModules: Pick<StandardModule, "id" | "description">[];
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
  enforceBritishEnglish: boolean;
}

const renderFrameworkTemplate = Handlebars.compile(frameworkTemplateSource, {
  noEscape: true,
});
const renderAgentsTemplate = Handlebars.compile(agentsTemplateSource, {
  noEscape: true,
});

function createViewModel(
  moduleIds?: StandardModuleSelection[],
  options?: { britishEnglish?: boolean },
): RendererViewModel {
  const selectedModules = getSelectedStandardModules(moduleIds);
  const selectedIds = new Set(selectedModules.map((module) => module.id));

  return {
    installedModules: selectedModules.map(({ id, description }) => ({
      id,
      description,
    })),
    frameworkSections: selectedModules
      .map((module) => module.framework)
      .filter(Boolean),
    agentRules: selectedModules.map((module) => module.agents).filter(Boolean),
    includesDecisionRecords: selectedIds.has("decision-records"),
    includesTesting: selectedIds.has("testing"),
    includesArchitecture:
      selectedIds.has("hexagonal-architecture") || selectedIds.has("ddd"),
    includesCodeStyle: selectedIds.has("code-style"),
    includesAirsyncMemory: selectedIds.has("airsync-memory"),
    includesErrorHandling: selectedIds.has("error-handling"),
    includesStructuredLogging: selectedIds.has("structured-logging"),
    includesFrontend: selectedIds.has("frontend"),
    enforceBritishEnglish: options?.britishEnglish ?? false,
  };
}

function trimRenderedDocument(content: string): string {
  return `${content.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderFramework(
  moduleIds?: StandardModuleSelection[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderFrameworkTemplate(createViewModel(moduleIds, options)),
  );
}

export function renderAgents(
  moduleIds?: StandardModuleSelection[],
  options?: { britishEnglish?: boolean },
): string {
  return trimRenderedDocument(
    renderAgentsTemplate(createViewModel(moduleIds, options)),
  );
}
