# ADR-0005: Add a project-scoped token-efficiency module backed by Caveman

- Status: Accepted
- Date: 2026-04-21

## Context

The framework needed an optional way to reduce response verbosity and token usage without changing the global configuration of the user's AI tools.

`caveman` already provides a reusable terse-response skill and can be installed through the existing `npx skills add` flow. By contrast, other token-efficiency tooling such as shell-output hooks would require machine-level setup and would leak outside the selected project.

## Decision

Aircury will add a local, default-enabled `token-efficiency` standards module.

The module will:

- add project rules that make agent responses terse by default while preserving full technical accuracy
- start each new local project session in `caveman full`
- keep the behavior project-scoped through generated agent instruction files
- allow users to disable the terse style in-session with `stop caveman` or `normal mode`

Aircury will also add a matching non-default `token-efficiency` skill group containing:

- `JuliusBrussee/caveman@caveman`

Because the module is enabled by default for local installs, the installer will preselect that skill group during the initial local installation flow unless the user explicitly disables the module.

## Consequences

- Teams can enable lower-verbosity sessions per project without affecting unrelated repositories.
- The installer remains consistent with the existing skill-catalog flow because `caveman` is modeled as a normal installable skill.
- Global hook-based token compression tooling is intentionally excluded from this module because it would not remain project-scoped.
