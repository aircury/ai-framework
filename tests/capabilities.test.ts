import { describe, expect, it } from "bun:test";
import {
  createCapabilityProfile,
  FRAMEWORK_MAINTAINED_NOTICE,
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
      "clean-architecture",
      "layered-architecture",
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
      "semantic-line-breaks",
    ]);
  });

  it("installs the DDD+Hexagonal skill only for DDD+Hexagonal", () => {
    expect(
      getCapabilitySkills(["ddd-hexagonal"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toContain("clean-ddd-hexagonal");

    expect(
      getCapabilitySkills(["clean-architecture"], "local").map(
        (skill) => skill.skillName,
      ),
    ).not.toContain("clean-ddd-hexagonal");

    expect(
      getCapabilitySkills(["layered-architecture"], "local").map(
        (skill) => skill.skillName,
      ),
    ).not.toContain("clean-ddd-hexagonal");
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

    expect(getCapabilityById("clean-architecture")).toMatchObject({
      label: "Clean Architecture",
      category: "engineering",
      modules: ["clean-architecture"],
    });
    expect(getCapabilityById("clean-architecture").framework).toContain(
      "## Clean Architecture Rules",
    );

    expect(getCapabilityById("layered-architecture")).toMatchObject({
      label: "Layered Architecture",
      category: "engineering",
      modules: ["layered-architecture"],
    });
    expect(getCapabilityById("layered-architecture").framework).toContain(
      "## Layered Architecture Rules",
    );

    expect(getCapabilityById("testing")).toMatchObject({
      modules: ["testing"],
    });
    expect(
      getCapabilityById("testing").skills?.map((skill) => skill.skillName),
    ).toEqual(["playwright-best-practices", "e2e-testing-patterns"]);
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
      _notice: FRAMEWORK_MAINTAINED_NOTICE,
      capabilities: ["frontend", "language"],
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

  it("allows only one architecture capability at a time", () => {
    expect(
      resolveCapabilityIds([
        "ddd-hexagonal",
        "clean-architecture",
        "layered-architecture",
      ]),
    ).toEqual(["layered-architecture"]);
    expect(
      resolveCapabilityIds(["clean-architecture", "ddd-hexagonal"]),
    ).toEqual(["ddd-hexagonal"]);
    expect(
      resolveCapabilityIds(["layered-architecture", "clean-architecture"]),
    ).toEqual(["clean-architecture"]);
  });

  it("does not preselect an architecture capability", () => {
    const localDefaults = getInitialCapabilityIds("local");
    const globalDefaults = getInitialCapabilityIds("global");

    expect(localDefaults).not.toContain("ddd-hexagonal");
    expect(localDefaults).not.toContain("clean-architecture");
    expect(localDefaults).not.toContain("layered-architecture");
    expect(globalDefaults).not.toContain("ddd-hexagonal");
    expect(globalDefaults).not.toContain("clean-architecture");
    expect(globalDefaults).not.toContain("layered-architecture");
  });
});
