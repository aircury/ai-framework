import { describe, expect, it } from "bun:test";
import {
  createCapabilityProfile,
  getCapabilities,
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
      "hexagonal-architecture",
      "ddd",
      "code-style",
      "airsync-memory",
      "error-handling",
      "structured-logging",
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
      "hexagonal-architecture",
      "ddd",
      "code-style",
      "airsync-memory",
      "error-handling",
      "structured-logging",
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
      "frontend",
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
      "frontend-ui-generator",
      "specs-extractor",
      "specs-interpreter",
    ]);
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
