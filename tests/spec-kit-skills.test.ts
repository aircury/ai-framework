import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getCapabilityById } from "../src/capabilities";

const SKILLS_DIR = join(import.meta.dir, "..", "skills");

const specKitSkillNames = (getCapabilityById("spec-kit").skills ?? []).map(
  (skill) => skill.skillName,
);

const readSkill = (name: string) =>
  readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");

const specKitSkillDirs = readdirSync(SKILLS_DIR).filter((name) =>
  name.startsWith("spec-kit-"),
);

describe("spec-kit skills", () => {
  it("installs the whole sequence, with convergence after implementation", () => {
    expect(specKitSkillNames).toEqual([
      "spec-kit-specify",
      "spec-kit-clarify",
      "spec-kit-plan",
      "spec-kit-tasks",
      "spec-kit-analyse",
      "spec-kit-implement",
      "spec-kit-converge",
      "spec-kit-checklist",
    ]);
  });

  it("ships every installed skill, and installs every shipped one", () => {
    for (const name of specKitSkillNames) {
      expect(existsSync(join(SKILLS_DIR, name, "SKILL.md"))).toBe(true);
    }
    expect([...specKitSkillDirs].sort()).toEqual([...specKitSkillNames].sort());
  });

  it("names its own skill in its front matter", () => {
    for (const name of specKitSkillNames) {
      expect(readSkill(name)).toContain(`\nname: ${name}\n`);
    }
  });

  it("hands over only to skills the capability installs", () => {
    for (const name of specKitSkillNames) {
      const named = readSkill(name).match(/\bspec-kit-[a-z-]+/g) ?? [];
      for (const reference of named) {
        expect(specKitSkillNames).toContain(reference);
      }
    }
  });

  it("names convergence as the step after implementation", () => {
    expect(readSkill("spec-kit-implement")).toContain(
      "Use the `spec-kit-converge` skill",
    );
  });
});
