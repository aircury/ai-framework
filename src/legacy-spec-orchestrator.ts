import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  FUNCTIONALITY_PARSER_SYSTEM_PROMPT,
  MICRO_SPEC_EXTRACTOR_SYSTEM_PROMPT,
  PROJECT_MAPPER_SYSTEM_PROMPT,
  SPEC_AUDITOR_SYSTEM_PROMPT,
} from "./legacy-spec-prompts";

export interface EvidenceBundle {
  related_tests: string[];
  related_models: string[];
  related_repositories: string[];
  related_fixtures: string[];
  behavioral_config: string[];
  related_frontend_flows: string[];
  related_jobs: string[];
  relevant_schema_files: string[];
}

export interface DomainDescriptor {
  name: string;
  description: string;
  core_files: string[];
  evidence_bundle: EvidenceBundle;
}

export interface UseCaseDescriptor {
  name: string;
  trigger: string;
  involved_files: string[];
  evidence_bundle: EvidenceBundle;
}

export interface DomainAnalysis extends DomainDescriptor {
  use_cases: UseCaseDescriptor[];
}

export interface ProjectMap {
  domains: DomainDescriptor[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface JsonSchemaDefinition {
  name: string;
  schema: Record<string, unknown>;
}

export interface OpenAiChatClient {
  createChatCompletion(input: {
    model: string;
    messages: ChatMessage[];
    responseFormat?:
      | { type: "text" }
      | { type: "json_schema"; json_schema: JsonSchemaDefinition };
    temperature?: number;
  }): Promise<string>;
}

export interface OrchestratorOptions {
  projectRoot: string;
  outputRoot?: string;
  databaseSchemaPath?: string;
  model?: string;
  maxFileBytes?: number;
  maxSchemaBytes?: number;
  retries?: number;
  client?: OpenAiChatClient;
}

export interface OrchestrationResult {
  map: ProjectMap;
  analysedDomains: DomainAnalysis[];
  writtenSpecs: string[];
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4";
const DEFAULT_OUTPUT_ROOT = "specs";
const DEFAULT_MAX_FILE_BYTES = 16_000;
const DEFAULT_MAX_SCHEMA_BYTES = 32_000;
const DEFAULT_RETRIES = 3;
const MAX_FILES_PER_EVIDENCE_CATEGORY = 8;
const EXCLUDED_DIRS = new Set([
  ".git",
  ".idea",
  ".vscode",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
]);
const CONFIG_CANDIDATES = [
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "tsconfig.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "requirements.txt",
  "pyproject.toml",
  "Pipfile",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "Gemfile",
  "mix.exs",
  "docker-compose.yml",
  "docker-compose.yaml",
];
const EVIDENCE_BUNDLE_PROPERTIES = {
  related_tests: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  related_models: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  related_repositories: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  related_fixtures: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  behavioral_config: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  related_frontend_flows: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  related_jobs: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
  relevant_schema_files: {
    type: "array",
    items: { type: "string", minLength: 1 },
    default: [],
  },
} as const satisfies Record<keyof EvidenceBundle, Record<string, unknown>>;
const EVIDENCE_BUNDLE_REQUIRED = Object.keys(EVIDENCE_BUNDLE_PROPERTIES);
const EVIDENCE_BUNDLE_LABELS: Record<keyof EvidenceBundle, string> = {
  related_tests: "Related tests",
  related_models: "Related entities and models",
  related_repositories: "Related repositories and query logic",
  related_fixtures: "Related fixtures and seeds",
  behavioral_config: "Behavior-affecting config",
  related_frontend_flows: "Related frontend flows",
  related_jobs: "Related commands, jobs, mailers, and workers",
  relevant_schema_files: "Relevant schema and migrations",
};

const PROJECT_MAP_SCHEMA: JsonSchemaDefinition = {
  name: "project_map",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["domains"],
    properties: {
      domains: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "description", "core_files", "evidence_bundle"],
          properties: {
            name: { type: "string", minLength: 1 },
            description: { type: "string", minLength: 1 },
            core_files: {
              type: "array",
              minItems: 1,
              items: { type: "string", minLength: 1 },
            },
            evidence_bundle: {
              type: "object",
              additionalProperties: false,
              required: EVIDENCE_BUNDLE_REQUIRED,
              properties: EVIDENCE_BUNDLE_PROPERTIES,
            },
          },
        },
      },
    },
  },
};

const DOMAIN_ANALYSIS_SCHEMA: JsonSchemaDefinition = {
  name: "domain_analysis",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["name", "description", "core_files", "evidence_bundle", "use_cases"],
    properties: {
      name: { type: "string", minLength: 1 },
      description: { type: "string", minLength: 1 },
      core_files: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 1 },
      },
      evidence_bundle: {
        type: "object",
        additionalProperties: false,
        required: EVIDENCE_BUNDLE_REQUIRED,
        properties: EVIDENCE_BUNDLE_PROPERTIES,
      },
      use_cases: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "trigger", "involved_files", "evidence_bundle"],
          properties: {
            name: { type: "string", minLength: 1 },
            trigger: { type: "string", minLength: 1 },
            involved_files: {
              type: "array",
              minItems: 1,
              items: { type: "string", minLength: 1 },
            },
            evidence_bundle: {
              type: "object",
              additionalProperties: false,
              required: EVIDENCE_BUNDLE_REQUIRED,
              properties: EVIDENCE_BUNDLE_PROPERTIES,
            },
          },
        },
      },
    },
  },
};

export class HttpOpenAiChatClient implements OpenAiChatClient {
  constructor(
    private readonly apiKey = process.env.OPENAI_API_KEY,
    private readonly baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  ) {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
  }

  async createChatCompletion(input: {
    model: string;
    messages: ChatMessage[];
    responseFormat?:
      | { type: "text" }
      | { type: "json_schema"; json_schema: JsonSchemaDefinition };
    temperature?: number;
  }): Promise<string> {
    const responseFormat =
      input.responseFormat?.type === "json_schema"
        ? {
            type: "json_schema",
            json_schema: {
              name: input.responseFormat.json_schema.name,
              strict: true,
              schema: input.responseFormat.json_schema.schema,
            },
          }
        : { type: "text" };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature ?? 0.1,
        response_format: responseFormat,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error ${response.status}: ${await response.text()}`,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI API returned an empty response");
    }
    return content;
  }
}

export async function runLegacySpecOrchestrator(
  options: OrchestratorOptions,
): Promise<OrchestrationResult> {
  const projectRoot = path.resolve(options.projectRoot);
  const outputRoot = path.resolve(
    projectRoot,
    options.outputRoot ?? DEFAULT_OUTPUT_ROOT,
  );
  const client = options.client ?? new HttpOpenAiChatClient();
  const model = options.model ?? DEFAULT_MODEL;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const maxFileBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const maxSchemaBytes = options.maxSchemaBytes ?? DEFAULT_MAX_SCHEMA_BYTES;

  const directoryTree = await buildDirectoryTree(projectRoot);
  const projectFiles = await listProjectFiles(projectRoot);
  const configBundle = await readConfigBundle(projectRoot, maxFileBytes);
  const schemaDocument = await readOptionalSchema(
    projectRoot,
    options.databaseSchemaPath,
    maxSchemaBytes,
  );

  const projectMap = await callStructuredAgent<ProjectMap>({
    client,
    model,
    retries,
    systemPrompt: PROJECT_MAPPER_SYSTEM_PROMPT,
    userPrompt: [
      "Map this legacy project into business domains.",
      "",
      "# Directory tree",
      directoryTree,
      "",
      "# Config files",
      configBundle || "(none found)",
      "",
      "# Database schema",
      schemaDocument || "(none provided)",
    ].join("\n"),
    schema: PROJECT_MAP_SCHEMA,
    validator: isProjectMap,
  });

  const analysedDomains: DomainAnalysis[] = [];
  const writtenSpecs: string[] = [];

  for (const mappedDomain of projectMap.domains) {
    const domain = enrichDomainDescriptor(mappedDomain, projectFiles);
    const domainEvidenceBundle = await readEvidenceBundle(
      projectRoot,
      domain.evidence_bundle,
      maxFileBytes,
    );
    const domainCoreFilesBundle = await readSelectedFiles(
      projectRoot,
      domain.core_files,
      maxFileBytes,
    );
    const analysedDomain = await callStructuredAgent<DomainAnalysis>({
      client,
      model,
      retries,
      systemPrompt: FUNCTIONALITY_PARSER_SYSTEM_PROMPT,
      userPrompt: [
        "Discover the use cases for this mapped domain.",
        "",
        "# Domain JSON",
        JSON.stringify(domain, null, 2),
        "",
        "# Domain boundary files",
        domainCoreFilesBundle || "(none found)",
        "",
        "# Domain evidence bundle",
        domainEvidenceBundle || "(none found)",
      ].join("\n"),
      schema: DOMAIN_ANALYSIS_SCHEMA,
      validator: (value): value is DomainAnalysis =>
        isDomainAnalysis(value) &&
        value.name === domain.name &&
        value.description === domain.description,
    });

    const enrichedDomainAnalysis = enrichDomainAnalysis(analysedDomain, projectFiles);
    analysedDomains.push(enrichedDomainAnalysis);

    for (const useCase of enrichedDomainAnalysis.use_cases) {
      const useCaseSourceBundle = await readSelectedFiles(
        projectRoot,
        useCase.involved_files,
        maxFileBytes,
      );
      const mergedEvidenceBundle = mergeEvidenceBundles(
        enrichedDomainAnalysis.evidence_bundle,
        useCase.evidence_bundle,
      );
      const mergedEvidenceText = await readEvidenceBundle(
        projectRoot,
        mergedEvidenceBundle,
        maxFileBytes,
      );
      const relevantSchema = selectRelevantSchema(
        schemaDocument,
        [
          enrichedDomainAnalysis.name,
          useCase.name,
          useCase.trigger,
          ...useCase.involved_files,
          ...mergedEvidenceBundle.relevant_schema_files,
        ].join(" "),
        maxSchemaBytes,
      );
      const rawSpec = await callTextAgent({
        client,
        model,
        systemPrompt: MICRO_SPEC_EXTRACTOR_SYSTEM_PROMPT,
        userPrompt: [
          "Extract a micro-spec for exactly one use case.",
          "",
          "# Domain",
          JSON.stringify(
            {
              name: enrichedDomainAnalysis.name,
              description: enrichedDomainAnalysis.description,
            },
            null,
            2,
          ),
          "",
          "# Use case",
          JSON.stringify(useCase, null, 2),
          "",
          "# Domain boundary files",
          domainCoreFilesBundle || "(none found)",
          "",
          "# Use case source files",
          useCaseSourceBundle || "(none found)",
          "",
          "# Expanded evidence bundle",
          mergedEvidenceText || "(none found)",
          "",
          "# Relevant database schema",
          relevantSchema || "(none provided)",
        ].join("\n"),
      });

      const auditedSpec = await callTextAgent({
        client,
        model,
        systemPrompt: SPEC_AUDITOR_SYSTEM_PROMPT,
        userPrompt: [
          "Audit and correct this single-use-case specification.",
          "",
          "# Candidate markdown",
          rawSpec,
          "",
          "# Use case source files",
          useCaseSourceBundle || "(none found)",
          "",
          "# Expanded evidence bundle",
          mergedEvidenceText || "(none found)",
          "",
          "# Relevant database schema",
          relevantSchema || "(none provided)",
        ].join("\n"),
      });

      const outputPath = path.join(
        outputRoot,
        slugify(domain.name),
        `${slugify(useCase.name)}.md`,
      );
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${auditedSpec.trim()}\n`, "utf8");
      writtenSpecs.push(outputPath);
    }
  }

  return {
    map: {
      domains: projectMap.domains.map((domain) => enrichDomainDescriptor(domain, projectFiles)),
    },
    analysedDomains,
    writtenSpecs,
  };
}

export async function buildDirectoryTree(rootDir: string): Promise<string> {
  const lines: string[] = [path.basename(rootDir) || "."];
  await appendDirectoryTree(rootDir, "", lines);
  return lines.join("\n");
}

async function appendDirectoryTree(
  currentDir: string,
  prefix: string,
  lines: string[],
): Promise<void> {
  const entries = (await readdir(currentDir, { withFileTypes: true }))
    .filter((entry) => !EXCLUDED_DIRS.has(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const [index, entry] of entries.entries()) {
    const isLast = index === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${branch}${entry.name}${entry.isDirectory() ? "/" : ""}`);
    if (entry.isDirectory()) {
      await appendDirectoryTree(
        path.join(currentDir, entry.name),
        `${prefix}${isLast ? "    " : "│   "}`,
        lines,
      );
    }
  }
}

async function listProjectFiles(projectRoot: string): Promise<string[]> {
  const files: string[] = [];
  await appendProjectFiles(projectRoot, projectRoot, files);
  return files.sort((left, right) => left.localeCompare(right));
}

async function appendProjectFiles(
  projectRoot: string,
  currentDir: string,
  files: string[],
): Promise<void> {
  const entries = (await readdir(currentDir, { withFileTypes: true }))
    .filter((entry) => !EXCLUDED_DIRS.has(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await appendProjectFiles(projectRoot, absolutePath, files);
      continue;
    }
    files.push(path.relative(projectRoot, absolutePath).split(path.sep).join("/"));
  }
}

async function readConfigBundle(
  projectRoot: string,
  maxFileBytes: number,
): Promise<string> {
  const segments: string[] = [];
  for (const relativePath of CONFIG_CANDIDATES) {
    const absolutePath = path.join(projectRoot, relativePath);
    const content = await readIfExists(absolutePath, maxFileBytes);
    if (!content) continue;
    segments.push(formatFileBundleEntry(relativePath, content));
  }
  return segments.join("\n\n");
}

async function readSelectedFiles(
  projectRoot: string,
  relativePaths: string[],
  maxFileBytes: number,
): Promise<string> {
  const deduped = [...new Set(relativePaths)];
  const segments: string[] = [];
  for (const relativePath of deduped) {
    const absolutePath = path.join(projectRoot, relativePath);
    const content = await readIfExists(absolutePath, maxFileBytes);
    if (!content) continue;
    segments.push(formatFileBundleEntry(relativePath, content));
  }
  return segments.join("\n\n");
}

async function readEvidenceBundle(
  projectRoot: string,
  evidenceBundle: EvidenceBundle,
  maxFileBytes: number,
): Promise<string> {
  const sections: string[] = [];
  for (const category of Object.keys(EVIDENCE_BUNDLE_LABELS) as Array<keyof EvidenceBundle>) {
    const files = evidenceBundle[category];
    if (files.length === 0) continue;
    const bundle = await readSelectedFiles(projectRoot, files, maxFileBytes);
    if (!bundle) continue;
    sections.push(`## ${EVIDENCE_BUNDLE_LABELS[category]}\n\n${bundle}`);
  }
  return sections.join("\n\n");
}

async function readOptionalSchema(
  projectRoot: string,
  explicitSchemaPath: string | undefined,
  maxSchemaBytes: number,
): Promise<string> {
  if (explicitSchemaPath) {
    return (await readIfExists(path.resolve(projectRoot, explicitSchemaPath), maxSchemaBytes)) ?? "";
  }

  const schemaCandidates = [
    "schema.sql",
    "db/schema.sql",
    "database/schema.sql",
    "prisma/schema.prisma",
    "supabase/schema.sql",
  ];

  for (const relativePath of schemaCandidates) {
    const content = await readIfExists(
      path.join(projectRoot, relativePath),
      maxSchemaBytes,
    );
    if (content) return content;
  }

  return "";
}

async function readIfExists(
  absolutePath: string,
  maxBytes: number,
): Promise<string | null> {
  try {
    const content = await readFile(absolutePath, "utf8");
    if (content.length <= maxBytes) return content;
    return `${content.slice(0, maxBytes)}\n\n[TRUNCATED after ${maxBytes} characters]`;
  } catch {
    return null;
  }
}

function formatFileBundleEntry(relativePath: string, content: string): string {
  return [`--- FILE: ${relativePath} ---`, content.trim()].join("\n");
}

function enrichDomainDescriptor(
  domain: DomainDescriptor,
  projectFiles: string[],
): DomainDescriptor {
  const coreFiles = dedupePaths(domain.core_files);
  const evidenceBundle = expandEvidenceBundle(
    projectFiles,
    mergeEvidenceBundles(
      createEmptyEvidenceBundle(),
      normaliseEvidenceBundle(domain.evidence_bundle),
    ),
    [domain.name, domain.description, ...coreFiles],
    coreFiles,
  );
  return {
    name: domain.name,
    description: domain.description,
    core_files: coreFiles,
    evidence_bundle: evidenceBundle,
  };
}

function enrichDomainAnalysis(
  domain: DomainAnalysis,
  projectFiles: string[],
): DomainAnalysis {
  const enrichedDomain = enrichDomainDescriptor(domain, projectFiles);
  return {
    ...enrichedDomain,
    use_cases: domain.use_cases.map((useCase) => {
      const involvedFiles = dedupePaths(useCase.involved_files);
      return {
        name: useCase.name,
        trigger: useCase.trigger,
        involved_files: involvedFiles,
        evidence_bundle: expandEvidenceBundle(
          projectFiles,
          mergeEvidenceBundles(
            enrichedDomain.evidence_bundle,
            normaliseEvidenceBundle(useCase.evidence_bundle),
          ),
          [
            enrichedDomain.name,
            enrichedDomain.description,
            useCase.name,
            useCase.trigger,
            ...involvedFiles,
          ],
          [...enrichedDomain.core_files, ...involvedFiles],
        ),
      };
    }),
  };
}

export function createEmptyEvidenceBundle(): EvidenceBundle {
  return {
    related_tests: [],
    related_models: [],
    related_repositories: [],
    related_fixtures: [],
    behavioral_config: [],
    related_frontend_flows: [],
    related_jobs: [],
    relevant_schema_files: [],
  };
}

export function normaliseEvidenceBundle(value: unknown): EvidenceBundle {
  if (!isRecord(value)) return createEmptyEvidenceBundle();

  return {
    related_tests: normaliseStringArray(value.related_tests),
    related_models: normaliseStringArray(value.related_models),
    related_repositories: normaliseStringArray(value.related_repositories),
    related_fixtures: normaliseStringArray(value.related_fixtures),
    behavioral_config: normaliseStringArray(value.behavioral_config),
    related_frontend_flows: normaliseStringArray(value.related_frontend_flows),
    related_jobs: normaliseStringArray(value.related_jobs),
    relevant_schema_files: normaliseStringArray(value.relevant_schema_files),
  };
}

export function mergeEvidenceBundles(
  ...bundles: EvidenceBundle[]
): EvidenceBundle {
  const merged = createEmptyEvidenceBundle();
  for (const bundle of bundles) {
    for (const category of Object.keys(merged) as Array<keyof EvidenceBundle>) {
      merged[category] = dedupePaths([...merged[category], ...bundle[category]]);
    }
  }
  return merged;
}

export function expandEvidenceBundle(
  projectFiles: string[],
  bundle: EvidenceBundle,
  hintTexts: string[],
  anchorFiles: string[],
): EvidenceBundle {
  const normalized = mergeEvidenceBundles(createEmptyEvidenceBundle(), bundle);
  const tokens = buildHintTokens(hintTexts, anchorFiles);
  const anchorDirs = buildAnchorDirectories(anchorFiles);

  for (const category of Object.keys(normalized) as Array<keyof EvidenceBundle>) {
    const existing = normalized[category];
    const limit = MAX_FILES_PER_EVIDENCE_CATEGORY;
    if (existing.length >= limit) {
      normalized[category] = existing.slice(0, limit);
      continue;
    }

    const additions = projectFiles.filter((relativePath) => {
      if (existing.includes(relativePath) || anchorFiles.includes(relativePath)) return false;
      if (!matchesEvidenceCategory(relativePath, category)) return false;
      return isRelevantToHints(relativePath, tokens, anchorDirs);
    });

    normalized[category] = dedupePaths([...existing, ...additions]).slice(0, limit);
  }

  return normalized;
}

function normaliseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return dedupePaths(
    value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0),
  );
}

function dedupePaths(paths: string[]): string[] {
  return [...new Set(paths.map((entry) => entry.trim()).filter(Boolean))];
}

function buildHintTokens(hintTexts: string[], anchorFiles: string[]): Set<string> {
  const rawTokens = [...hintTexts, ...anchorFiles.map(fileStemFromPath)]
    .flatMap((entry) =>
      entry
        .toLowerCase()
        .split(/[^a-z0-9_]+/)
        .filter((token) => token.length >= 3),
    )
    .filter((token) => !GENERIC_HINT_TOKENS.has(token));
  return new Set(rawTokens);
}

const GENERIC_HINT_TOKENS = new Set([
  "the",
  "and",
  "with",
  "from",
  "this",
  "that",
  "flow",
  "case",
  "core",
  "file",
  "files",
  "domain",
  "service",
  "controller",
  "module",
  "feature",
  "page",
  "view",
  "form",
  "user",
]);

function buildAnchorDirectories(anchorFiles: string[]): Set<string> {
  return new Set(
    anchorFiles
      .map((relativePath) => relativePath.split("/").slice(0, -1).join("/"))
      .filter(Boolean),
  );
}

function fileStemFromPath(relativePath: string): string {
  return path.basename(relativePath).replace(/\.[^.]+$/, "");
}

function isRelevantToHints(
  relativePath: string,
  tokens: Set<string>,
  anchorDirs: Set<string>,
): boolean {
  const normalized = relativePath.toLowerCase();
  if ([...anchorDirs].some((dir) => dir && normalized.startsWith(`${dir.toLowerCase()}/`))) {
    return true;
  }
  if (tokens.size === 0) return false;
  return [...tokens].some((token) => normalized.includes(token));
}

function matchesEvidenceCategory(
  relativePath: string,
  category: keyof EvidenceBundle,
): boolean {
  const normalized = relativePath.toLowerCase();
  switch (category) {
    case "related_tests":
      return /(^|\/)(test|tests|__tests__)\//.test(normalized) || /\.(test|spec)\./.test(normalized);
    case "related_models":
      return /(\/|^)(model|models|entity|entities|value-object|value-objects|schema|schemas)(\/|$)/.test(
        normalized,
      );
    case "related_repositories":
      return /(\/|^)(repository|repositories|repo|repos|query|queries|dao|daos|store|stores)(\/|$)/.test(
        normalized,
      );
    case "related_fixtures":
      return /(\/|^)(fixture|fixtures|seed|seeds|factory|factories|faker)(\/|$)/.test(
        normalized,
      );
    case "behavioral_config":
      return (
        CONFIG_CANDIDATES.some((candidate) => candidate.toLowerCase() === normalized) ||
        /(\/|^)(config|configs|configuration|settings|env)(\/|$)/.test(normalized) ||
        /(^|\/)\.env(\.|$)/.test(normalized)
      );
    case "related_frontend_flows":
      return /(\/|^)(frontend|ui|pages|page|screens|views|components|routes|router|app)(\/|$)/.test(
        normalized,
      );
    case "related_jobs":
      return /(\/|^)(job|jobs|worker|workers|queue|queues|command|commands|task|tasks|cron|scheduler|schedulers|listener|listeners|consumer|consumers|mailer|mailers|mail|webhook|webhooks)(\/|$)/.test(
        normalized,
      );
    case "relevant_schema_files":
      return /(\/|^)(db|database|prisma|migrations?|schema|schemas)(\/|$)/.test(normalized);
  }
}

export function selectRelevantSchema(
  schemaDocument: string,
  hintText: string,
  maxBytes: number,
): string {
  if (!schemaDocument) return "";
  if (schemaDocument.length <= maxBytes) return schemaDocument;

  const tokens = new Set(
    hintText
      .toLowerCase()
      .split(/[^a-z0-9_]+/)
      .filter((token) => token.length >= 4),
  );
  const matchingLines = schemaDocument
    .split("\n")
    .filter((line) => {
      const normalized = line.toLowerCase();
      return [...tokens].some((token) => normalized.includes(token));
    })
    .join("\n");

  if (matchingLines.length >= 200) {
    return matchingLines.slice(0, maxBytes);
  }

  return `${schemaDocument.slice(0, maxBytes)}\n\n[TRUNCATED: full schema exceeded limit; relevance filter had low recall]`;
}

async function callStructuredAgent<T>(input: {
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
            content: `${input.userPrompt}${feedback ? `\n\n# Correction from previous failed attempt\n${feedback}` : ""}`,
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
      feedback = `Return a payload that matches the required schema exactly. Previous error: ${formatError(error)}`;
    }
  }

  throw new Error(
    `Structured agent failed after ${input.retries} attempts: ${formatError(lastError)}`,
  );
}

async function callTextAgent(input: {
  client: OpenAiChatClient;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  return input.client.createChatCompletion({
    model: input.model,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.userPrompt },
    ],
    responseFormat: { type: "text" },
    temperature: 0,
  });
}

export function parseJsonResponse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Response did not contain a valid JSON object");
    }
    return JSON.parse(match[0]);
  }
}

export function isProjectMap(value: unknown): value is ProjectMap {
  if (!isRecord(value) || !Array.isArray(value.domains) || value.domains.length === 0) {
    return false;
  }
  return value.domains.every(isDomainDescriptor);
}

export function isDomainAnalysis(value: unknown): value is DomainAnalysis {
  if (!isDomainDescriptor(value)) return false;
  const candidate = value as DomainAnalysis;
  if (!Array.isArray(candidate.use_cases)) return false;
  return candidate.use_cases.every(isUseCaseDescriptor);
}

function isDomainDescriptor(value: unknown): value is DomainDescriptor {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.description === "string" &&
    value.description.length > 0 &&
    Array.isArray(value.core_files) &&
    value.core_files.length > 0 &&
    value.core_files.every((entry) => typeof entry === "string" && entry.length > 0) &&
    isEvidenceBundle(value.evidence_bundle)
  );
}

function isUseCaseDescriptor(value: unknown): value is UseCaseDescriptor {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.trigger === "string" &&
    value.trigger.length > 0 &&
    Array.isArray(value.involved_files) &&
    value.involved_files.length > 0 &&
    value.involved_files.every(
      (entry) => typeof entry === "string" && entry.length > 0,
    ) &&
    isEvidenceBundle(value.evidence_bundle)
  );
}

function isEvidenceBundle(value: unknown): value is EvidenceBundle {
  if (!isRecord(value)) return false;
  return (Object.keys(createEmptyEvidenceBundle()) as Array<keyof EvidenceBundle>).every(
    (category) =>
      Array.isArray(value[category]) &&
      value[category].every(
        (entry: unknown) => typeof entry === "string" && entry.length > 0,
      ),
  );
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readCliArg(flag: string): string | undefined {
  const index = Bun.argv.indexOf(flag);
  if (index === -1) return undefined;
  return Bun.argv[index + 1];
}

function hasCliFlag(flag: string): boolean {
  return Bun.argv.includes(flag);
}

function renderUsage(): string {
  return [
    "Usage: bun run src/legacy-spec-orchestrator.ts [options]",
    "",
    "Options:",
    "  --project-root <path>   Project root to analyse. Defaults to current directory.",
    "  --output-root <path>    Relative output directory for generated specs. Defaults to specs/.",
    "  --db-schema <path>      Relative path to the database schema file.",
    "  --model <name>          OpenAI model name. Defaults to OPENAI_MODEL or gpt-5.4.",
    "  --retries <n>           Structured-output retry count. Defaults to 3.",
    "  --help                  Show this help text.",
    "",
    "Environment:",
    "  OPENAI_API_KEY          Required to run the orchestration.",
    "  OPENAI_BASE_URL         Optional API base URL override.",
    "  OPENAI_MODEL            Optional default model override.",
  ].join("\n");
}

async function main(): Promise<void> {
  if (hasCliFlag("--help")) {
    console.log(renderUsage());
    return;
  }

  const projectRoot = readCliArg("--project-root") ?? process.cwd();
  const outputRoot = readCliArg("--output-root");
  const databaseSchemaPath = readCliArg("--db-schema");
  const model = readCliArg("--model");
  const retries = readCliArg("--retries");

  const result = await runLegacySpecOrchestrator({
    projectRoot,
    outputRoot,
    databaseSchemaPath,
    model,
    retries: retries ? Number(retries) : undefined,
  });

  console.log(
    JSON.stringify(
      {
        domains: result.map.domains.length,
        analysedDomains: result.analysedDomains.length,
        writtenSpecs: result.writtenSpecs,
      },
      null,
      2,
    ),
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
