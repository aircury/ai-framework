# Drop OpenSpec workflow capability

- Status: Accepted
- Date: 2026-09-07

## Context

The Aircury AI Framework installed four OpenSpec workflow skills (`open-spec-propose`, `open-spec-apply`, `open-spec-complete`, `open-spec-explore`) and exposed a dedicated capability with `defaultSelected: true`. The capability routed agents to two modes in the meta-agent routing table: `propose-apply-complete` for complex-but-clear changes and `explore-propose-apply-complete` for changes whose root cause or scope is unclear.

These modes duplicated discipline that Spec Kit already enforces through formal specification, clarification, planning, tasks, and analysis. Both pipelines converged on the same canonical record (`specs/features/`), and both wrote their working artefacts into the same `specs/changes/` directory. Maintaining two parallel proposal pipelines added installer surface, framework template content, documentation overhead, and four shipped skills without a clear boundary in the routing logic.

## Decision

Remove the OpenSpec capability from the framework.

Concretely:

- Delete the `open-spec` entry from `src/capabilities.ts`, the `CapabilityId` union, and `CAPABILITY_ORDER`.
- Delete `skills/open-spec-propose`, `skills/open-spec-apply`, `skills/open-spec-complete`, and `skills/open-spec-explore`.
- Remove `propose-apply-complete` and `explore-propose-apply-complete` from the routing table in `templates/framework.md.hbs` and `docs/concepts.md`.
- Update `README.md`, `docs/playbook.md`, `docs/implementation.md`, and tests to reflect the removal.

The meta-agent router now recommends `plan-build`, `spec-kit`, or direct implementation. Spec Kit remains the workflow for new features, cross-cutting work, and changes that need formal clarification. The constitutional rule about `specs/changes/` and the automatic `.gitignore` entry stay because Spec Kit still writes to that directory.

## Consequences

- Breaking change for projects that already have `open-spec` selected in `.aircury/framework.config.json`. Their saved profile will fail to resolve the capability id until they edit the file.
- The `propose-apply-complete` and `explore-propose-apply-complete` modes disappear from the agent vocabulary. Agents must recommend `spec-kit` or `plan-build` for the tasks those modes used to cover.
- Skills ecosystem loses four skills. Users who still want a separate explore-then-propose cadence can use Spec Kit's `spec-kit-clarify` step.
- The framework becomes smaller: one fewer capability manifest, four fewer skill packages, and fewer template rules to maintain.