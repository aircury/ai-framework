import Handlebars from 'handlebars';
import agentsTemplateSource from '../templates/agents.md.hbs' with { type: 'text' };
import frameworkTemplateSource from '../templates/framework.md.hbs' with { type: 'text' };
import { getSelectedStandardModules } from './framework';
import type { StandardModule, StandardModuleId } from './framework';

interface RendererViewModel {
  installedModules: Pick<StandardModule, 'id' | 'description'>[];
  frameworkSections: string[];
  agentRules: string[];
  includesDecisionRecords: boolean;
  includesTdd: boolean;
  includesArchitecture: boolean;
  includesCodeStyle: boolean;
}

const renderFrameworkTemplate = Handlebars.compile(frameworkTemplateSource, { noEscape: true });
const renderAgentsTemplate = Handlebars.compile(agentsTemplateSource, { noEscape: true });

function createViewModel(moduleIds?: StandardModuleId[]): RendererViewModel {
  const selectedModules = getSelectedStandardModules(moduleIds);
  const selectedIds = new Set(selectedModules.map((module) => module.id));

  return {
    installedModules: selectedModules.map(({ id, description }) => ({ id, description })),
    frameworkSections: selectedModules.map((module) => module.framework).filter(Boolean),
    agentRules: selectedModules.map((module) => module.agents).filter(Boolean),
    includesDecisionRecords: selectedIds.has('decision-records'),
    includesTdd: selectedIds.has('tdd'),
    includesArchitecture:
      selectedIds.has('hexagonal-architecture') || selectedIds.has('ddd'),
    includesCodeStyle: selectedIds.has('code-style'),
  };
}

function trimRenderedDocument(content: string): string {
  return `${content.replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function renderFramework(moduleIds?: StandardModuleId[]): string {
  return trimRenderedDocument(renderFrameworkTemplate(createViewModel(moduleIds)));
}

export function renderAgents(moduleIds?: StandardModuleId[]): string {
  return trimRenderedDocument(renderAgentsTemplate(createViewModel(moduleIds)));
}
