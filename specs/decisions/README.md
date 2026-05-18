# Architecture Decision Records

`specs/decisions/` stores ADRs that preserve architectural and workflow intent.

- Create a new ADR when a material decision is introduced or superseded.
- ADRs are editable only while `Status: Draft`.
- An ADR leaves `Draft` only when the user explicitly confirms that the functionality or change is complete and that the ADR should be published now.
- After every draft ADR modification, ask the user whether they want to publish it now; otherwise keep `Status: Draft`.
- Treat any ADR with a status other than `Draft`, or with no status, as immutable.
- Reference the superseded or amended ADR with `Supersedes: ADR-XXXX` or `Amends: ADR-XXXX` instead of rewriting history.
- Use `Supersedes: ADR-XXXX` when the new decision completely replaces or invalidates the old one.
- Use `Amends: ADR-XXXX` when the new decision modifies, clarifies, or adds to the old one without completely invalidating it.
- After creating the new ADR, update the prior ADR only to say that it changed and where the new ADR is, for example `Status: Superseded` and `Superseded by: ADR-YYYY`.
- Read relevant ADRs before changing areas they govern.
