import { describe, expect, it } from "bun:test";
import {
  DEFAULT_STANDARD_MODULE_IDS,
  getStandardModuleById,
  normalizeModuleIds,
  STANDARD_MODULES,
} from "../src/framework";

describe("framework modules", () => {
  it("has manifest-backed content for every registered module", () => {
    for (const module of STANDARD_MODULES) {
      expect(module.description.length).toBeGreaterThan(0);
      expect(module.framework.length).toBeGreaterThan(0);
    }
  });

  it("includes agent instructions in modules that apply to AGENTS.md", () => {
    expect(getStandardModuleById("decision-records").agents).toContain(
      "specs/decisions/",
    );
    expect(getStandardModuleById("tdd").agents).toContain(
      "Write the failing test first",
    );
    expect(getStandardModuleById("code-style").agents).toContain(
      "check `package.json`",
    );
  });

  it("uses all default-enabled modules when no explicit selection is provided", () => {
    expect(normalizeModuleIds()).toEqual(DEFAULT_STANDARD_MODULE_IDS);
  });
});
