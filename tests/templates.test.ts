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
      expect(FRAMEWORK).toContain("## Token Efficiency");
    });

    it("does not require commits as part of completion", () => {
      expect(FRAMEWORK).toContain(
        "Create git commits only when the user explicitly asks, using [Conventional Commits](https://www.conventionalcommits.org/) format.",
      );
      expect(FRAMEWORK).toContain(
        "When committing, organise changes into atomic Conventional Commits",
      );
      expect(FRAMEWORK).not.toContain(
        "Commit changes using the `commit-changes` skill",
      );
      expect(FRAMEWORK).not.toContain("atomic deployment");
    });
  });

  describe("AGENTS", () => {
    it("is a non-empty string", () => {
      expect(typeof AGENTS).toBe("string");
      expect(AGENTS.length).toBeGreaterThan(0);
    });

    it("references FRAMEWORK.md", () => {
      expect(AGENTS).toContain("FRAMEWORK.md");
      expect(AGENTS).toContain("single source of truth");
      expect(AGENTS).not.toContain(
        "Selecting `plan-build` authorises planning first, not automatic implementation.",
      );
    });

    it("matches the generated default profile", () => {
      expect(generateAgents()).toBe(AGENTS);
      expect(renderAgents()).toBe(AGENTS);
      expect(AGENTS).toContain("`caveman` is already active by default");
      expect(AGENTS).toContain("Start every new session in `caveman full`");
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

  describe("capability-aware generation", () => {
    it("adds ADR guidance only when the ADR capability is enabled", () => {
      expect(generateFramework(["decision-records"])).toContain(
        "## Architecture Decision Records",
      );
      expect(generateFramework([])).not.toContain(
        "## Architecture Decision Records",
      );
    });

    it("keeps one canonical ADR dual-write section when ADRs and Airsync are enabled", () => {
      const framework = generateFramework(["decision-records", "airsync"]);
      expect(framework).toContain("### ADR Dual-Write Rule");
      expect(framework).toContain(
        "If Airsync is enabled, follow the Airsync module's canonical ADR dual-write rule when an ADR is created or superseded.",
      );
      expect(framework).toContain(
        "If an ADR is created or superseded, propose it to Airsync when Airsync is enabled.",
      );
      expect(framework.match(/### ADR Dual-Write Rule/g)).toHaveLength(1);
      expect(framework.match(/- Use `memory_kind: "note"`/g)).toHaveLength(1);
      expect(framework.match(/- Use `scope: "team"`/g)).toHaveLength(1);
      expect(framework.match(/- Include `source_refs`/g)).toHaveLength(1);
      expect(framework).not.toContain(
        "Every ADR created or superseded MUST also be proposed to Airsync",
      );
    });

    it("adds testing guidance only when the testing capability is enabled", () => {
      expect(generateFramework(["testing"])).toContain("## TDD Workflow");
      expect(generateFramework([])).not.toContain("## TDD Workflow");
    });

    it("adds architecture rules only when architecture capabilities are enabled", () => {
      expect(generateFramework(["architecture"])).toContain(
        "## Non-Negotiable Architecture Rules",
      );
      expect(generateFramework([])).not.toContain(
        "## Non-Negotiable Architecture Rules",
      );
    });

    it("keeps AGENTS.md stable across capability selections", () => {
      expect(generateAgents(["decision-records"])).toBe(generateAgents([]));
      expect(generateAgents(["code-style"])).toBe(generateAgents([]));
    });

    it("adds design-system search guidance when the frontend module is enabled", () => {
      expect(generateFramework(["frontend"])).toContain(
        "extracted from the existing frontend with `frontend-style-extractor`",
      );
      expect(generateFramework(["frontend"])).toContain(
        "Use the `frontend-style-extractor` skill on the target frontend",
      );
    });

    it("keeps AGENTS.md stable across non-token-efficiency module selections", () => {
      expect(generateAgents(["decision-records"])).toBe(
        generateAgents(["code-style"]),
      );
      expect(generateAgents(["decision-records", "frontend"])).toBe(
        generateAgents(["code-style", "frontend"]),
      );
    });

    it("adds token-efficiency guidance to AGENTS.md only when the module is enabled", () => {
      expect(generateAgents(["token-efficiency"])).toContain(
        "Start every new session in `caveman full`",
      );
      expect(generateAgents()).toContain(
        "Start every new session in `caveman full`",
      );
      expect(generateAgents(["decision-records"])).not.toContain(
        "Start every new session in `caveman full`",
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
      expect(generateAgents([], { britishEnglish: true })).toBe(
        generateAgents([]),
      );
      expect(generateFramework([])).not.toContain(
        "Use British English spelling",
      );
    });

    it("adds token-efficiency guidance only when the capability is enabled", () => {
      expect(generateFramework(["token-efficiency"])).toContain(
        "## Token Efficiency",
      );
      expect(generateFramework(["token-efficiency"])).toContain(
        "Load and apply the `caveman` skill in `full` mode",
      );
      expect(generateFramework([])).not.toContain("## Token Efficiency");
      expect(generateFramework([])).not.toContain(
        "Load and apply the `caveman` skill in `full` mode",
      );
    });
  });
});
