# Modular framework standards and architecture decision records

## Context

The framework originally embedded Hexagonal Architecture, DDD, and TDD as mandatory rules for every installation.
That made the workflow opinionated but inflexible.
It also did not preserve architectural intent explicitly when AI agents introduced or changed important rules.
The repository referenced `specs/features/` as canonical behavior without installing starter paths for specs or decisions.

## Decision

Aircury separates a shared workflow constitution from optional standards modules selected at install time.

The initial built-in modules are:

- `decision-records`
- `tdd`
- `ddd-hexagonal`
- `ddd`

Local installations persist their selected modules in `.aircury/framework.config.json`.

When the `decision-records` module is enabled, agents read relevant ADRs and keep a single current ADR under `specs/decisions/` for each material architectural or workflow decision.
ADR filenames use unique descriptive slugs, and ADR links use explicit repository-relative Markdown paths.

## Consequences

- Teams can keep Aircury's routing and spec-driven workflow without being forced into the same testing or architecture standards.
- New standards can be added through the shared module registry instead of redesigning the installer.
- The framework has explicit, current intent records for cross-cutting decisions.
- Installations create starter spec paths so canonical documentation exists from day one.
