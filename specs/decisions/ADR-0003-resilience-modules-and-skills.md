# ADR-0003: Add resilience modules and default resilience skills

- Status: Accepted
- Date: 2026-04-19

## Context

The framework already ships opinionated standards for architecture, testing, code style, and decision records, but it did not provide first-class guidance for two common operational concerns: error handling and logging.

Those concerns were starting to appear in framework discussions as important cross-cutting rules, but treating them as one combined standard would blur two different decisions:

- how projects classify and recover from failures
- how projects emit safe, structured diagnostics

The framework also needed corresponding installable skills so generated setups could reinforce these practices with reusable external guidance instead of relying only on local module text.

## Decision

Aircury will model resilience as two separate default-enabled standards modules:

- `error-handling`
- `structured-logging`

The `error-handling` module defines rules for distinguishing operational errors from programmer errors, failing fast on bugs, validating boundaries, and using bounded recovery patterns only when semantics allow them.

The `structured-logging` module defines rules for structured machine-readable logs, correlation identifiers, context-rich operational events, and strict exclusion or redaction of secrets and unnecessary sensitive data.

Aircury will also install a default `resilience` skill group with two external skills:

- `wshobson/agents@error-handling-patterns`
- `aj-geddes/useful-ai-prompts@logging-best-practices`

## Consequences

- New installations receive explicit guidance for failure semantics and diagnostics without requiring teams to invent those standards ad hoc.
- Teams can still reason about error handling and logging independently because each concern is modelled as its own module.
- Generated framework documents now treat resilience as a first-class engineering concern alongside architecture, tests, and code style.
- Default skill installation becomes broader, so local installs pull in two more external skills by default.
