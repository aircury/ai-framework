import type {
  JsonSchemaDefinition,
  OpenAiChatClient,
  ProjectMap,
} from "../src/legacy-spec-orchestrator";
import {
  createEmptyEvidenceBundle,
  expandEvidenceBundle,
  isDomainAnalysis,
  isProjectMap,
  mergeEvidenceBundles,
  normaliseEvidenceBundle,
  parseJsonResponse,
  selectRelevantSchema,
  slugify,
} from "../src/legacy-spec-orchestrator";

export {
  createEmptyEvidenceBundle,
  expandEvidenceBundle,
  isDomainAnalysis,
  isProjectMap,
  mergeEvidenceBundles,
  normaliseEvidenceBundle,
  parseJsonResponse,
  selectRelevantSchema,
  slugify,
};

export async function callStructuredAgentForTest(
  responses: string[],
): Promise<ProjectMap> {
  let callCount = 0;
  const client: OpenAiChatClient = {
    async createChatCompletion() {
      const response = responses[callCount];
      callCount += 1;
      if (response === undefined) {
        throw new Error("No more mocked responses");
      }
      return response;
    },
  };

  return callStructuredAgentInternal({
    client,
    model: "gpt-5.4",
    retries: responses.length,
    systemPrompt: "system",
    userPrompt: "user",
    schema: {
      name: "project_map",
      schema: { type: "object" },
    } satisfies JsonSchemaDefinition,
    validator: isProjectMap,
  });
}

async function callStructuredAgentInternal<T>(input: {
  client: OpenAiChatClient;
  model: string;
  retries: number;
  systemPrompt: string;
  userPrompt: string;
  schema: JsonSchemaDefinition;
  validator: (value: unknown) => value is T;
}): Promise<T> {
  let feedback = "";
  let lastError: unknown;

  for (let attempt = 1; attempt <= input.retries; attempt++) {
    try {
      const content = await input.client.createChatCompletion({
        model: input.model,
        messages: [
          { role: "system", content: input.systemPrompt },
          {
            role: "user",
            content: `${input.userPrompt}${feedback ? `\n${feedback}` : ""}`,
          },
        ],
        responseFormat: {
          type: "json_schema",
          json_schema: input.schema,
        },
        temperature: 0,
      });
      const parsed = parseJsonResponse(content);
      if (!input.validator(parsed)) {
        throw new Error("Model returned JSON that failed semantic validation");
      }
      return parsed;
    } catch (error) {
      lastError = error;
      feedback = error instanceof Error ? error.message : String(error);
    }
  }

  throw lastError;
}
