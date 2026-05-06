import { describe, expect, it } from "bun:test";
import {
  createCapabilityProfile,
  getCapabilities,
  getCapabilityById,
  getCapabilityFiles,
  getCapabilitySkills,
  getInitialCapabilityIds,
  resolveCapabilityIds,
} from "../src/capabilities";

describe("capabilities", () => {
  it("preselects the default local capabilities", () => {
    expect(getInitialCapabilityIds("local")).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "ddd-hexagonal",
      "decision-records",
      "testing",
      "code-style",
      "frontend",
      "token-efficiency",
      "resilience",
      "specs",
    ]);
  });

  it("adds the language capability when British English is enabled", () => {
    expect(getInitialCapabilityIds("local", { britishEnglish: true })).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "ddd-hexagonal",
      "decision-records",
      "testing",
      "code-style",
      "frontend",
      "token-efficiency",
      "resilience",
      "specs",
      "language",
    ]);
  });

  it("lists the visible global capabilities", () => {
    expect(
      getCapabilities("global").map((capability) => capability.id),
    ).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "ddd-hexagonal",
      "testing",
      "frontend",
      "token-efficiency",
      "resilience",
      "specs",
      "language",
    ]);
  });

  it("expands selected capabilities into unique installable skills", () => {
    expect(
      getCapabilitySkills(
        ["open-spec", "git", "frontend", "specs", "ddd-hexagonal"],
        "local",
      ).map((skill) => skill.skillName),
    ).toEqual([
      "open-spec-propose",
      "open-spec-apply",
      "open-spec-complete",
      "open-spec-explore",
      "commit-changes",
      "clean-ddd-hexagonal",
      "frontend-ui-workflow",
      "vercel-react-best-practices",
      "specs-extractor",
      "specs-interpreter",
    ]);
  });

  it("keeps standards and skills under the selected capability", () => {
    expect(getCapabilityById("ddd-hexagonal")).toMatchObject({
      label: "DDD+Hexagonal",
      category: "engineering",
      modules: ["ddd-hexagonal", "ddd"],
    });
    expect(getCapabilityById("ddd-hexagonal").framework).toContain(
      "## Non-Negotiable Architecture Rules",
    );
    expect(
      getCapabilityById("ddd-hexagonal").skills?.map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["clean-ddd-hexagonal"]);

    expect(getCapabilityById("testing")).toMatchObject({
      modules: ["testing"],
    });
    expect(
      getCapabilityById("testing").skills?.map((skill) => skill.skillName),
    ).toEqual(["playwright-best-practices", "e2e-testing-patterns"]);
  });

  it("maps the legacy architecture capability id to ddd-hexagonal", () => {
    expect(resolveCapabilityIds(["architecture"])).toEqual(["ddd-hexagonal"]);
    expect(createCapabilityProfile(["architecture"]).capabilities).toContain(
      "ddd-hexagonal",
    );
    expect(getCapabilityById("architecture").id).toBe("ddd-hexagonal");
  });

  it("returns capability-owned files", () => {
    expect(
      getCapabilityFiles(["frontend", "decision-records"], "local"),
    ).toEqual([
      {
        path: "docs/aircury/capabilities/decision-records.md",
        content: expect.any(String),
        description: "ADRs capability rules",
      },
      {
        path: "specs/decisions/README.md",
        content: expect.any(String),
        description: "ADR starter guide",
      },
      {
        path: "docs/aircury/capabilities/frontend.md",
        content: expect.any(String),
        description: "Frontend capability rules",
      },
      {
        path: "specs/ui/README.md",
        content: expect.any(String),
        description: "Frontend design system starter guide",
      },
      {
        path: "specs/ui/frontend-workflow.md",
        content: expect.any(String),
        description: "Frontend workflow reference",
      },
    ]);
  });

  it("creates a version 2 capability profile", () => {
    expect(
      createCapabilityProfile(["frontend"], { britishEnglish: true }),
    ).toEqual({
      version: 2,
      capabilities: ["frontend", "language"],
      language: {
        britishEnglish: true,
      },
    });
  });

  it("migrates version 1 modules to version 2 capabilities", () => {
    expect(
      createCapabilityProfile({
        version: 1,
        modules: ["decision-records", "tdd", "hexagonal-architecture", "ddd"],
      }),
    ).toEqual({
      version: 2,
      capabilities: ["architecture", "decision-records", "testing"],
      language: {
        britishEnglish: false,
      },
    });
  });

  it("migrates legacy operational modules to the resilience capability", () => {
    expect(
      createCapabilityProfile({
        version: 1,
        modules: ["airsync-memory", "error-handling", "structured-logging"],
        language: {
          britishEnglish: true,
        },
      }),
    ).toEqual({
      version: 2,
      capabilities: ["airsync", "resilience", "language"],
      language: {
        britishEnglish: true,
      },
    });
  });

  it("keeps capability resolution stable", () => {
    expect(resolveCapabilityIds(["git", "frontend", "git"])).toEqual([
      "git",
      "frontend",
    ]);
  });
});
