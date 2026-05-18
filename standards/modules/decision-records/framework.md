## Architecture Decision Records

This installation uses ADRs to preserve architectural and workflow intent over time.

## ADR Rules

- Store ADRs under `specs/decisions/`.
- Create a new draft ADR when a task introduces a material architectural or workflow decision.
- Read relevant ADRs before implementing work in an area governed by prior decisions.
- ADRs are mutable only while their status is `Draft`.
- An ADR leaves `Draft` only when the user explicitly confirms that the functionality or change is complete and that the ADR should no longer be a draft.
- Agents must not promote draft ADRs on their own.
- After every modification to a draft ADR, ask the user whether they want to publish it now. If the user does not explicitly confirm publication, keep `Status: Draft`.
- Treat any ADR whose status is not exactly `Draft` as immutable, including `Accepted`, `Approved`, `Published`, `Superseded`, `Deprecated`, missing, or unknown statuses.
- Do not edit non-draft ADRs. When direction changes, create a new ADR that explicitly references the prior decision with `Supersedes: ADR-XXXX` or `Amends: ADR-XXXX`.
- Use `Supersedes: ADR-XXXX` when the new decision completely replaces or invalidates the old one.
- Use `Amends: ADR-XXXX` when the new decision modifies, clarifies, or adds to the old one without completely invalidating it.
- After creating the superseding or amending ADR, update the prior non-draft ADR only to mark that it was changed and where the new decision lives, for example `Status: Superseded` and `Superseded by: ADR-YYYY`.
- Do not change the prior ADR's Context, Decision, Reason, or Consequences when marking it as superseded or amended; preserve its historical record intact.

## ADR Dual-Write to Airsync

If Airsync is enabled, follow the Airsync module's canonical ADR dual-write rule when an ADR is created or superseded.

## ADR Template

```md
# ADR-XXXX: <decision title>

- Status: Draft | Accepted | Superseded | Deprecated
- Date: YYYY-MM-DD
- Supersedes: ADR-XXXX (optional)
- Amends: ADR-XXXX (optional)
- Superseded by: ADR-YYYY (only when updating a prior ADR marker)

## Context
<why this decision is needed>

## Decision
<what was decided>

## Consequences
<tradeoffs, follow-ups, and constraints>
```
