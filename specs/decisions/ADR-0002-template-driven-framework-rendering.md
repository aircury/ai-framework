# ADR-0002: Render framework documents from templates and module manifests

- Status: Accepted
- Date: 2026-04-08

## Context

The first modular framework iteration removed most hard-coded rules from TypeScript, but document generation still relied on large inline strings and conditional assembly logic inside the application code. That made the framework shell difficult to edit and mixed rendering concerns with module registry concerns.

## Decision

Aircury will render generated framework documents from dedicated template files and treat each standards module as a content package.

Each standards module now contains:

- `module.json` for machine-readable metadata
- `framework.md` for `FRAMEWORK.md` content
- `agents.md` for `AGENTS.md` rules

Shared document shells live in:

- `templates/framework.md.hbs`
- `templates/agents.md.hbs`

The renderer composes selected modules into those templates using Handlebars.

## Consequences

- Maintainers can edit document structure without touching orchestration code.
- Module content and module metadata now evolve together in one folder.
- TypeScript is reduced to registry, renderer, and installer orchestration.
- New standards modules are easier to add and reason about consistently across generated files.
