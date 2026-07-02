## Walking Skeleton Bootstrap

This installation can use the external `walking-skeleton` skill to bootstrap greenfield projects from reviewable ADRs and a tiny end-to-end slice.

## Walking Skeleton Rules

- Use this capability for new-project bootstrap work, not for ordinary feature delivery in an established codebase.
- Treat bundled skeleton ADRs as proposals and flavours, not as mandatory company architecture.
- Select ADRs deliberately with the team, ideally during project kickoff when stack, infrastructure, database, frontend, authentication, testing, and deployment assumptions can be reviewed together.
- Prefer a known ADR flavour when one fits the project; otherwise combine individual ADRs and resolve conflicts explicitly before building.
- Use `/walking-skeleton plan` before writing code so selected ADRs are copied into `specs/decisions/` with project constants centralised in `ADR-0000`.
- Use `/walking-skeleton spec` to define the smallest useful end-to-end behaviour that proves the selected architectural seams.
- Use `/walking-skeleton build` only after ADRs and the walking-skeleton spec have been reviewed.
- The bootstrap phase may build without strict TDD when the objective is proving the executable stack. After the walking skeleton is complete, normal framework rules apply, including TDD where automated testing is feasible.
- Verify the result with a clean rebuild, linting, tests, and smoke checks before treating the skeleton as complete.
- When the skill reveals a reusable ADR, flavour, failure mode, or company convention, capture it through the normal ADR and Airsync workflows when those capabilities are enabled.

## External Source

The walking-skeleton implementation lives outside this framework in `aircury/walking-skeleton`. This framework only recommends and installs the skill; it does not vendor the ADR catalogue or generated example code.
