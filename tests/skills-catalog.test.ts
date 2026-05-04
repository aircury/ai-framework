import { describe, expect, it } from "bun:test";
import {
  expandSkillGroups,
  getDefaultSkillGroupIds,
  getRequiredSkillGroupIdsForModules,
  getSkillGroups,
  resolveSkillGroupIds,
} from "../src/skills-catalog";

describe("skills catalog", () => {
  it("installs the core workflow skill groups by default", () => {
    expect(getDefaultSkillGroupIds("local")).toEqual([
      "open-spec",
      "spec-kit",
      "git",
      "specs",
    ]);
  });

  it("does not install capability skills without selected capabilities", () => {
    expect(getDefaultSkillGroupIds("local")).not.toContain("token-efficiency");
    expect(getDefaultSkillGroupIds("local")).not.toContain("frontend");
    expect(getDefaultSkillGroupIds("local")).not.toContain("testing");
  });

  it("adds the language group when British English is enabled", () => {
    expect(resolveSkillGroupIds("local", { britishEnglish: true })).toEqual([
      "open-spec",
      "spec-kit",
      "git",
      "language",
      "specs",
    ]);
  });

  it("keeps the default skill groups when British English is disabled", () => {
    expect(resolveSkillGroupIds("local", { britishEnglish: false })).toEqual(
      getDefaultSkillGroupIds("local"),
    );
  });

  it("derives the frontend group when the frontend capability is enabled", () => {
    expect(resolveSkillGroupIds("local", { moduleIds: ["frontend"] })).toEqual([
      "open-spec",
      "spec-kit",
      "git",
      "frontend",
      "specs",
    ]);
  });

  it("combines British English and capability-derived groups", () => {
    expect(
      resolveSkillGroupIds("local", {
        britishEnglish: true,
        moduleIds: ["frontend"],
      }),
    ).toEqual([
      "open-spec",
      "spec-kit",
      "git",
      "language",
      "frontend",
      "specs",
    ]);
  });

  it("derives the token-efficiency group when the capability is enabled", () => {
    expect(
      resolveSkillGroupIds("local", { moduleIds: ["token-efficiency"] }),
    ).toEqual([...getDefaultSkillGroupIds("local"), "token-efficiency"]);
  });

  it("declares required skill groups for modules that have companion skills", () => {
    expect(
      getRequiredSkillGroupIdsForModules([
        "decision-records",
        "frontend",
        "testing",
        "token-efficiency",
      ]),
    ).toEqual(["airsync", "frontend", "testing", "token-efficiency"]);
  });

  it("derives module-required skill groups without accepting manual skill selection", () => {
    expect(
      resolveSkillGroupIds("local", {
        moduleIds: ["frontend", "token-efficiency"],
      }),
    ).toEqual([
      "open-spec",
      "spec-kit",
      "git",
      "frontend",
      "specs",
      "token-efficiency",
    ]);
  });

  it("returns the visible groups for a scope", () => {
    expect(getSkillGroups("local").map((group) => group.id)).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "resilience",
      "testing",
      "architecture",
      "language",
      "frontend",
      "specs",
      "token-efficiency",
    ]);
  });

  it("expands selected groups into installable skills", () => {
    expect(
      expandSkillGroups(["open-spec", "git"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual([
      "open-spec-propose",
      "open-spec-apply",
      "open-spec-complete",
      "open-spec-explore",
      "commit-changes",
    ]);
  });

  it("deduplicates repeated selected groups", () => {
    expect(
      expandSkillGroups(["git", "git"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["commit-changes"]);
  });

  it("includes curated external skills when their group is selected", () => {
    expect(
      expandSkillGroups(["architecture"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["clean-ddd-hexagonal"]);
  });

  it("includes the resilience skills when their group is selected", () => {
    expect(
      expandSkillGroups(["resilience"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["error-handling-patterns", "logging-best-practices"]);
  });

  it("includes the testing skills when their group is selected", () => {
    expect(
      expandSkillGroups(["testing"], "local").map((skill) => skill.skillName),
    ).toEqual(["e2e-testing-patterns", "playwright-best-practices"]);
  });

  it("includes the UK business English skill when its group is selected", () => {
    expect(
      expandSkillGroups(["language"], "local").map((skill) => skill.skillName),
    ).toEqual(["uk-business-english"]);
  });

  it("includes the frontend skills when their group is selected", () => {
    expect(
      expandSkillGroups(["frontend"], "local").map((skill) => skill.skillName),
    ).toEqual([
      "frontend-layout-extractor",
      "frontend-experience-extractor",
      "frontend-ui-generator",
    ]);
  });

  it("includes the specs skills when their group is selected", () => {
    expect(
      expandSkillGroups(["specs"], "local").map((skill) => skill.skillName),
    ).toEqual(["specs-extractor", "specs-interpreter"]);
  });

  it("includes caveman when the token-efficiency group is selected", () => {
    expect(
      expandSkillGroups(["token-efficiency"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["caveman"]);
  });
});
