import { describe, expect, it } from "bun:test";
import { parseGlobalAgentIds, validateGlobalAgentIds } from "../src/tui";

describe("parseGlobalAgentIds", () => {
  it("parses comma-separated agent ids", () => {
    expect(parseGlobalAgentIds("claude-code, opencode, cursor")).toEqual([
      "claude-code",
      "opencode",
      "cursor",
    ]);
  });

  it("trims whitespace and drops empty entries", () => {
    expect(parseGlobalAgentIds(" claude-code , , opencode ,, ")).toEqual([
      "claude-code",
      "opencode",
    ]);
  });
});

describe("validateGlobalAgentIds", () => {
  it("accepts valid agent ids", () => {
    expect(validateGlobalAgentIds("claude-code, opencode")).toBeUndefined();
  });

  it("rejects empty input", () => {
    expect(validateGlobalAgentIds(" , , ")).toBe(
      "Enter at least one agent id.",
    );
  });

  it("rejects none as a standalone value", () => {
    expect(validateGlobalAgentIds("none")).toBe(
      "Use real agent ids only. Remove 'none'.",
    );
  });

  it("rejects none among agent ids", () => {
    expect(validateGlobalAgentIds("claude-code, none, opencode")).toBe(
      "Use real agent ids only. Remove 'none'.",
    );
  });
});
