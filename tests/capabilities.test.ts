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
      "ask-question",
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
      "ask-question",
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
      "custom-architecture",
      "testing",
      "frontend",
      "token-efficiency",
      "resilience",
      "specs",
      "language",
      "ask-question",
      "database",
    ]);
  });

  it("maps legacy database capability ids to the database pack", () => {
    expect(resolveCapabilityIds(["blind-db-debugging"])).toEqual(["database"]);
    expect(resolveCapabilityIds(["db-schema-design"])).toEqual(["database"]);
    expect(
      getCapabilitySkills(["blind-db-debugging", "db-schema-design"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["blind-db-debugging", "db-schema-design"]);
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
      "dbml-database-docs",
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

    expect(getCapabilityById("custom-architecture")).toMatchObject({
      label: "Custom Architecture",
      category: "engineering",
      modules: ["custom-architecture"],
    });
    expect(getCapabilityById("custom-architecture").framework).toContain(
      "## Custom Architecture Rules",
    );
    expect(
      getCapabilityById("custom-architecture").skills?.map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["custom-architecture"]);

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

  it("documents ADR immutability after draft status", () => {
    const files = getCapabilityFiles(["decision-records"], "local");
    const capabilityRules = files.find(
      (file) => file.path === "docs/aircury/capabilities/decision-records.md",
    );
    const starterGuide = files.find(
      (file) => file.path === "specs/decisions/README.md",
    );

    expect(capabilityRules?.content).toContain(
      "ADRs are mutable only while their status is `Draft`.",
    );
    expect(capabilityRules?.content).toContain(
      "An ADR leaves `Draft` only when the user explicitly confirms that the functionality or change is complete and that the ADR should no longer be a draft.",
    );
    expect(capabilityRules?.content).toContain(
      "Agents must not promote draft ADRs on their own.",
    );
    expect(capabilityRules?.content).toContain(
      "After every modification to a draft ADR, ask the user whether they want to publish it now.",
    );
    expect(capabilityRules?.content).toContain("Do not edit non-draft ADRs.");
    expect(capabilityRules?.content).toContain(
      "update the prior non-draft ADR only to mark that it was changed and where the new decision lives",
    );
    expect(capabilityRules?.content).toContain(
      "Use `Supersedes: ADR-XXXX` when the new decision completely replaces or invalidates the old one.",
    );
    expect(capabilityRules?.content).toContain(
      "Use `Amends: ADR-XXXX` when the new decision modifies, clarifies, or adds to the old one without completely invalidating it.",
    );
    expect(capabilityRules?.content).toContain(
      "- Superseded by: ADR-YYYY (only when updating a prior ADR marker)",
    );
    expect(capabilityRules?.content).toContain(
      "- Status: Draft | Accepted | Superseded | Deprecated",
    );
    expect(capabilityRules?.content).toContain("- Amends: ADR-XXXX (optional)");
    expect(starterGuide?.content).toContain(
      "ADRs are editable only while `Status: Draft`.",
    );
    expect(starterGuide?.content).toContain(
      "An ADR leaves `Draft` only when the user explicitly confirms that the functionality or change is complete and that the ADR should be published now.",
    );
    expect(starterGuide?.content).toContain(
      "After every draft ADR modification, ask the user whether they want to publish it now",
    );
    expect(starterGuide?.content).toContain(
      "`Supersedes: ADR-XXXX` or `Amends: ADR-XXXX`",
    );
    expect(starterGuide?.content).toContain(
      "update the prior ADR only to say that it changed and where the new ADR is",
    );
    expect(starterGuide?.content).toContain(
      "Use `Supersedes: ADR-XXXX` when the new decision completely replaces or invalidates the old one.",
    );
    expect(starterGuide?.content).toContain(
      "Use `Amends: ADR-XXXX` when the new decision modifies, clarifies, or adds to the old one without completely invalidating it.",
    );
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
        "custom-architecture",
      ]),
    ).toEqual(["custom-architecture"]);
    expect(
      resolveCapabilityIds(["clean-architecture", "ddd-hexagonal"]),
    ).toEqual(["ddd-hexagonal"]);
    expect(
      resolveCapabilityIds(["layered-architecture", "clean-architecture"]),
    ).toEqual(["clean-architecture"]);
    expect(
      resolveCapabilityIds(["custom-architecture", "ddd-hexagonal"]),
    ).toEqual(["ddd-hexagonal"]);
  });

  it("does not preselect an architecture capability", () => {
    const localDefaults = getInitialCapabilityIds("local");
    const globalDefaults = getInitialCapabilityIds("global");

    expect(localDefaults).not.toContain("ddd-hexagonal");
    expect(localDefaults).not.toContain("clean-architecture");
    expect(localDefaults).not.toContain("layered-architecture");
    expect(localDefaults).not.toContain("custom-architecture");
    expect(globalDefaults).not.toContain("ddd-hexagonal");
    expect(globalDefaults).not.toContain("clean-architecture");
    expect(globalDefaults).not.toContain("layered-architecture");
    expect(globalDefaults).not.toContain("custom-architecture");
  });
});
