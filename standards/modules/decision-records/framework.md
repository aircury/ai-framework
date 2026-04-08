## Architecture Decision Records

This installation uses ADRs to preserve architectural and workflow intent over time.

## ADR Rules

- Store ADRs under `specs/decisions/`.
- Create or update an ADR when a task introduces, changes, or supersedes a material architectural or workflow decision.
- Read relevant ADRs before implementing work in an area governed by prior decisions.
- Do not silently rewrite history when direction changes. Create a new ADR that references the superseded decision.

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
