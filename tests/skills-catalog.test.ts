import { describe, expect, it } from "bun:test";
import {
  expandSkillGroups,
  getDefaultSkillGroupIds,
  getInitialSkillGroupIds,
  getSkillGroups,
} from "../src/skills-catalog";

describe("skills catalog", () => {
  it("preselects the Aircury groups by default", () => {
    expect(getDefaultSkillGroupIds("local")).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "resilience",
      "testing",
      "architecture",
    ]);
  });

  it("adds the language group to initial selection when British English is enabled", () => {
    expect(getInitialSkillGroupIds("local", { britishEnglish: true })).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "resilience",
      "testing",
      "architecture",
      "language",
    ]);
  });

  it("keeps the default initial selection when British English is disabled", () => {
    expect(getInitialSkillGroupIds("local", { britishEnglish: false })).toEqual(
      getDefaultSkillGroupIds("local"),
    );
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
      expandSkillGroups(["testing"], "local").map(
        (skill) => skill.skillName,
      ),
    ).toEqual(["e2e-testing-patterns", "playwright-best-practices"]);
  });

  it("includes the UK business English skill when its group is selected", () => {
    expect(
      expandSkillGroups(["language"], "local").map((skill) => skill.skillName),
    ).toEqual(["uk-business-english"]);
  });
});
