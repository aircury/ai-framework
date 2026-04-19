import { describe, expect, it } from "bun:test";
import {
  expandSkillGroups,
  getDefaultSkillGroupIds,
  getSkillGroups,
} from "../src/skills-catalog";

describe("skills catalog", () => {
  it("preselects the Aircury groups by default", () => {
    expect(getDefaultSkillGroupIds("local")).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "architecture",
    ]);
  });

  it("returns the visible groups for a scope", () => {
    expect(getSkillGroups("local").map((group) => group.id)).toEqual([
      "open-spec",
      "spec-kit",
      "airsync",
      "git",
      "architecture",
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
});
