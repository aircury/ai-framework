import { describe, expect, it } from "bun:test";
import { renderAgents, renderFramework } from "../src/renderer";
import {
  AGENTS,
  FRAMEWORK,
  generateAgents,
  generateFramework,
  generateOpencodeAgent,
} from "../src/templates";

describe("templates", () => {
  describe("FRAMEWORK", () => {
    it("is a non-empty string", () => {
      expect(typeof FRAMEWORK).toBe("string");
      expect(FRAMEWORK.length).toBeGreaterThan(0);
    });

    it("contains core framework sections", () => {
      expect(FRAMEWORK).toContain("## Core Workflow Constitution");
      expect(FRAMEWORK).toContain("## Definition of Done");
      expect(FRAMEWORK).toContain("## Workflow Framework");
      expect(FRAMEWORK).toContain("### Mode execution rules");
    });

    it("matches the generated default profile", () => {
      expect(generateFramework()).toBe(FRAMEWORK);
      expect(renderFramework()).toBe(FRAMEWORK);
    });
  });

  describe("AGENTS", () => {
    it("is a non-empty string", () => {
      expect(typeof AGENTS).toBe("string");
      expect(AGENTS.length).toBeGreaterThan(0);
    });

    it("references FRAMEWORK.md", () => {
      expect(AGENTS).toContain("FRAMEWORK.md");
      expect(AGENTS).toContain(
        "Selecting `plan-build` authorises planning first, not automatic implementation.",
      );
    });

    it("matches the generated default profile", () => {
      expect(generateAgents()).toBe(AGENTS);
      expect(renderAgents()).toBe(AGENTS);
    });
  });

  describe("generateOpencodeAgent", () => {
    it("includes opencode frontmatter", () => {
      const output = generateOpencodeAgent();
      expect(output).toContain("---");
      expect(output).toContain("name: Aircury Agent");
      expect(output).toContain("mode: primary");
    });

    it("embeds FRAMEWORK.md content", () => {
      const output = generateOpencodeAgent();
      expect(output).toContain(FRAMEWORK);
    });

    it("is deterministic", () => {
      expect(generateOpencodeAgent()).toBe(generateOpencodeAgent());
    });
  });

  describe("module-aware generation", () => {
    it("adds ADR guidance only when the ADR module is enabled", () => {
      expect(generateFramework(["decision-records"])).toContain(
        "## Architecture Decision Records",
      );
      expect(generateFramework([])).not.toContain(
        "## Architecture Decision Records",
      );
    });

    it("adds testing guidance only when the testing module is enabled", () => {
      expect(generateFramework(["testing"])).toContain("## TDD Workflow");
      expect(generateFramework(["tdd"])).toContain("## TDD Workflow");
      expect(generateFramework([])).not.toContain("## TDD Workflow");
    });

    it("adds architecture rules only when architecture modules are enabled", () => {
      expect(generateFramework(["hexagonal-architecture", "ddd"])).toContain(
        "## Non-Negotiable Architecture Rules",
      );
      expect(generateFramework([])).not.toContain(
        "## Non-Negotiable Architecture Rules",
      );
    });

    it("adds ADR reading instructions to AGENTS.md only when enabled", () => {
      expect(generateAgents(["decision-records"])).toContain(
        "specs/decisions/",
      );
      expect(generateAgents([])).not.toContain("specs/decisions/");
    });

    it("adds code style instructions to AGENTS.md only when enabled", () => {
      expect(generateAgents(["code-style"])).toContain(
        "Analyze `package.json` and local config files to identify the project's linting and formatting strategy.",
      );
      expect(generateAgents([])).not.toContain(
        "Analyze `package.json` and local config files to identify the project's linting and formatting strategy.",
      );
    });

    it("adds code style header to FRAMEWORK.md when enabled", () => {
      expect(generateFramework(["code-style"])).toContain("## Code Style");
      expect(generateFramework([])).not.toContain("## Code Style");
    });

    it("adds British English guidance when enabled", () => {
      expect(generateFramework([], { britishEnglish: true })).toContain(
        "Use British English spelling",
      );
      expect(generateAgents([], { britishEnglish: true })).toContain(
        "Use British English spelling",
      );
      expect(generateFramework([])).not.toContain(
        "Use British English spelling",
      );
      expect(generateAgents([])).not.toContain("Use British English spelling");
    });

    it("adds token-efficiency guidance only when the module is enabled", () => {
      expect(generateFramework(["token-efficiency"])).toContain(
        "## Token Efficiency",
      );
      expect(generateAgents(["token-efficiency"])).toContain(
        "Respond tersely by default",
      );
      expect(generateFramework([])).not.toContain("## Token Efficiency");
      expect(generateAgents([])).not.toContain("Respond tersely by default");
    });
  });
});
