import { describe, expect, it } from "bun:test";
import {
  callStructuredAgentForTest,
  createEmptyEvidenceBundle,
  expandEvidenceBundle,
  isDomainAnalysis,
  isProjectMap,
  parseJsonResponse,
  selectRelevantSchema,
  slugify,
} from "./legacy-spec-orchestrator-test-helpers";

describe("legacy spec orchestrator", () => {
  it("parses JSON even when wrapped in extra prose", () => {
    expect(
      parseJsonResponse(
        'Result:\n{"domains":[{"name":"Billing","description":"Handles invoices","core_files":["src/billing.ts"],"evidence_bundle":{"related_tests":[],"related_models":[],"related_repositories":[],"related_fixtures":[],"behavioral_config":[],"related_frontend_flows":[],"related_jobs":[],"relevant_schema_files":[]}}]}',
      ),
    ).toEqual({
      domains: [
        {
          name: "Billing",
          description: "Handles invoices",
          core_files: ["src/billing.ts"],
          evidence_bundle: createEmptyEvidenceBundle(),
        },
      ],
    });
  });

  it("validates a project map with evidence bundles", () => {
    expect(
      isProjectMap({
        domains: [
          {
            name: "Accounts",
            description: "Owns customer accounts",
            core_files: ["src/accounts/routes.ts"],
            evidence_bundle: createEmptyEvidenceBundle(),
          },
        ],
      }),
    ).toBe(true);
  });

  it("validates a domain analysis with evidence bundles", () => {
    expect(
      isDomainAnalysis({
        name: "Accounts",
        description: "Owns customer accounts",
        core_files: ["src/accounts/routes.ts"],
        evidence_bundle: createEmptyEvidenceBundle(),
        use_cases: [
          {
            name: "Register Account",
            trigger: "POST /accounts",
            involved_files: ["src/accounts/routes.ts"],
            evidence_bundle: createEmptyEvidenceBundle(),
          },
        ],
      }),
    ).toBe(true);
  });

  it("retries when the first JSON response is invalid", async () => {
    const result = await callStructuredAgentForTest([
      "not json",
      JSON.stringify({
        domains: [
          {
            name: "Orders",
            description: "Owns order processing",
            core_files: ["src/orders.ts"],
            evidence_bundle: createEmptyEvidenceBundle(),
          },
        ],
      }),
    ]);

    expect(result.domains[0]?.name).toBe("Orders");
  });

  it("extracts relevant schema lines when the document is too large", () => {
    const schema = [
      "create table users (id uuid primary key);",
      "create table orders (id uuid primary key, user_id uuid not null);",
      "create table invoices (id uuid primary key);",
    ].join("\n");
    expect(selectRelevantSchema(schema.repeat(80), "orders checkout", 500)).toContain(
      "orders",
    );
  });

  it("expands evidence bundles with heuristically related files", () => {
    const expanded = expandEvidenceBundle(
      [
        "src/orders/routes.ts",
        "tests/orders/checkout.test.ts",
        "src/orders/models/order.ts",
        "src/orders/repositories/order-repository.ts",
        "src/orders/fixtures/order-seed.ts",
        "src/config/orders.ts",
        "src/orders/jobs/checkout-mailer.ts",
        "src/orders/ui/checkout-page.tsx",
        "prisma/migrations/20240101_orders.sql",
      ],
      createEmptyEvidenceBundle(),
      ["Orders checkout"],
      ["src/orders/routes.ts"],
    );

    expect(expanded.related_tests).toContain("tests/orders/checkout.test.ts");
    expect(expanded.related_models).toContain("src/orders/models/order.ts");
    expect(expanded.related_repositories).toContain(
      "src/orders/repositories/order-repository.ts",
    );
    expect(expanded.related_fixtures).toContain("src/orders/fixtures/order-seed.ts");
    expect(expanded.behavioral_config).toContain("src/config/orders.ts");
    expect(expanded.related_jobs).toContain("src/orders/jobs/checkout-mailer.ts");
    expect(expanded.related_frontend_flows).toContain(
      "src/orders/ui/checkout-page.tsx",
    );
    expect(expanded.relevant_schema_files).toContain(
      "prisma/migrations/20240101_orders.sql",
    );
  });

  it("slugifies domain and use case names for file output", () => {
    expect(slugify("Create Invoice PDF")).toBe("create-invoice-pdf");
  });
});
