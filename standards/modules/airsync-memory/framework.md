## Airsync Memory Integration

This installation uses Airsync as a collaborative memory system for AI agents and teams. Airsync uses a three-layer lifecycle (INBOX → PUBLISHED → ARCHIVED) to ensure only vetted knowledge becomes searchable by the team.

### When to Search Airsync

Before making decisions that could be influenced by prior team experience:

- Architectural choices (e.g., which pattern to use, how to structure modules)
- Workflow changes (e.g., how to handle specs, how to route agents)
- Technology selections that affect multiple components

### What to Capture in Airsync

Capture knowledge that passes the **collaboration test**: "Would a developer on a different project benefit from this in 3 months?"

**DO capture:**

- ADRs (dual-write from `specs/decisions/` as `note` with `scope: "team"`)
- Validated patterns and approaches that work across projects
- Repeated pitfalls and how to avoid them
- Team-wide conventions and standards
- Mental models that explain complex systems

**DO NOT capture:**

- Project-specific implementation details
- Debugging sessions without transferable lessons
- Content already in codebase, docs, or prior memory
- Transient observations without context

### ADR Dual-Write Rule

Every architectural or workflow decision recorded as an ADR in `specs/decisions/` MUST also be proposed to Airsync. This ensures team-wide discoverability even for developers outside the current project.

When proposing an ADR to Airsync:

- Use `memory_kind: "note"`
- Use `scope: "team"`
- Include tags: `["adr", "ADR-XXXX"]` (replace XXXX with the ADR number)
- Include `source_refs` pointing to the ADR file path in the repository
- Copy the ADR's Context, Decision, and Consequences sections as the memory content

### Airsync Workflow Summary

1. **Search first**: `memory_search(query="your terms", memory_kind="best_practice")`
2. **Propose to INBOX**: `memory_propose(entry={...})` — entries start in INBOX, not searchable by default
3. **Promote when confident**: `memory_promote(memory_id)` — moves to PUBLISHED, becomes searchable

See the `airsync` skill for the complete workflow and tool reference.
