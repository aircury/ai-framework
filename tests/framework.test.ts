import { describe, expect, it } from "bun:test";
import {
  DEFAULT_STANDARD_MODULE_IDS,
  getStandardModuleById,
  normaliseModuleIds,
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
    expect(getStandardModuleById("testing").agents).toContain(
      "Write the failing test first",
    );
    expect(getStandardModuleById("code-style").agents).toContain(
      "check `package.json`",
    );
    expect(getStandardModuleById("error-handling").agents).toContain(
      "operational errors",
    );
    expect(getStandardModuleById("structured-logging").agents).toContain(
      "structured logs",
    );
    expect(getStandardModuleById("testing").agents).toContain("Vitest");
  });

  it("uses all default-enabled modules when no explicit selection is provided", () => {
    expect(normaliseModuleIds()).toEqual(DEFAULT_STANDARD_MODULE_IDS);
  });

  it("maps the legacy tdd module id to testing", () => {
    expect(normaliseModuleIds(["tdd"])).toEqual(["testing"]);
    expect(getStandardModuleById("tdd").id).toBe("testing");
  });
});
