# ADR-0001: Modular framework standards and persistent ADR governance

- Status: Accepted
- Date: 2026-04-08

## Context

The framework originally embedded Hexagonal Architecture, DDD, and TDD as mandatory rules for every installation. That made the workflow opinionated but inflexible, and it did not preserve architectural intent explicitly when AI agents introduced or changed important rules. The repository also referenced `specs/features/` as canonical behavior without installing starter paths for specs or decisions.

## Decision

Aircury will separate a shared workflow constitution from optional standards modules selected at install time.

The initial built-in modules are:

- `decision-records`
- `tdd`
- `hexagonal-architecture`
- `ddd`

Local installations will persist their selected modules in `.aircury/framework.config.json`.

When the `decision-records` module is enabled, agents must read relevant ADRs and create or supersede ADRs under `specs/decisions/` when a task introduces or changes material architectural or workflow direction.

## Consequences

- Teams can keep Aircury's routing and spec-driven workflow without being forced into the same testing or architecture standards.
- New standards can be added through the shared module registry instead of redesigning the installer.
- The framework now has explicit, versioned intent records for cross-cutting decisions.
- Installations create starter spec paths so canonical documentation exists from day one.
