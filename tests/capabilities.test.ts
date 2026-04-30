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
      "architecture",
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
      "architecture",
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
      "architecture",
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
        ["open-spec", "git", "frontend", "specs", "architecture"],
        "local",
      ).map((skill) => skill.skillName),
    ).toEqual([
      "open-spec-propose",
      "open-spec-apply",
      "open-spec-complete",
      "open-spec-explore",
      "commit-changes",
      "clean-ddd-hexagonal",
      "frontend-layout-extractor",
      "frontend-experience-extractor",
      "frontend-style-extractor",
      "frontend-ui-generator",
      "specs-extractor",
      "specs-interpreter",
    ]);
  });

  it("keeps standards and skills under the selected capability", () => {
    expect(getCapabilityById("architecture")).toMatchObject({
      label: "Architecture",
      category: "engineering",
      modules: ["hexagonal-architecture", "ddd"],
    });
    expect(getCapabilityById("architecture").framework).toContain(
      "## Non-Negotiable Architecture Rules",
    );
    expect(
      getCapabilityById("architecture").skills?.map((skill) => skill.skillName),
    ).toEqual(["clean-ddd-hexagonal"]);

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
        path: "specs/decisions/README.md",
        content: expect.any(String),
        description: "ADR starter guide",
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

  it("keeps capability resolution stable", () => {
    expect(resolveCapabilityIds(["git", "frontend", "git"])).toEqual([
      "git",
      "frontend",
    ]);
  });
});
