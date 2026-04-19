## Architecture Decision Records

This installation uses ADRs to preserve architectural and workflow intent over time.

## ADR Rules

- Store ADRs under `specs/decisions/`.
- Create or update an ADR when a task introduces, changes, or supersedes a material architectural or workflow decision.
- Read relevant ADRs before implementing work in an area governed by prior decisions.
- Do not silently rewrite history when direction changes. Create a new ADR that references the superseded decision.

## ADR Dual-Write to Airsync

Every ADR created or superseded MUST also be proposed to Airsync as a team-scoped memory. This ensures that architectural decisions are discoverable by agents across all projects using Airsync, not just the current repository.

When proposing an ADR to Airsync:

- Use `memory_kind: "note"`
- Use `scope: "team"`
- Include tags: `["adr", "ADR-XXXX"]` (replace XXXX with the ADR number)
- Include `source_refs` pointing to the ADR file path
- Copy the ADR's Context, Decision, and Consections as the memory content

## ADR Template

```md
# ADR-XXXX: <decision title>

- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD
- Supersedes: ADR-XXXX (optional)

## Context
<why this decision is needed>

## Decision
<what was decided>

## Consequences
<tradeoffs, follow-ups, and constraints>
```
