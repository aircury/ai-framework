import installableLegacySpecOrchestratorTemplate from "../templates/legacy-spec-orchestrator.mjs.txt" with {
  type: "text",
};
import {
  FUNCTIONALITY_PARSER_SYSTEM_PROMPT,
  MICRO_SPEC_EXTRACTOR_SYSTEM_PROMPT,
  PROJECT_MAPPER_SYSTEM_PROMPT,
  SPEC_AUDITOR_SYSTEM_PROMPT,
} from "./legacy-spec-prompts";

export function renderInstallableLegacySpecOrchestrator(): string {
  return installableLegacySpecOrchestratorTemplate
    .replace(
      /__PROJECT_MAPPER_SYSTEM_PROMPT__/g,
      JSON.stringify(PROJECT_MAPPER_SYSTEM_PROMPT),
    )
    .replace(
      /__FUNCTIONALITY_PARSER_SYSTEM_PROMPT__/g,
      JSON.stringify(FUNCTIONALITY_PARSER_SYSTEM_PROMPT),
    )
    .replace(
      /__MICRO_SPEC_EXTRACTOR_SYSTEM_PROMPT__/g,
      JSON.stringify(MICRO_SPEC_EXTRACTOR_SYSTEM_PROMPT),
    )
    .replace(
      /__SPEC_AUDITOR_SYSTEM_PROMPT__/g,
      JSON.stringify(SPEC_AUDITOR_SYSTEM_PROMPT),
    );
}
