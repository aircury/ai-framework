# ADR-0004: Add a testing standards module and default testing skills

- Status: Accepted
- Date: 2026-04-20

## Context

The framework needed a fuller testing standard that covered delivery flow, test layers, and preferred frontend tooling in one place.

Treating `tdd` and `testing` as separate selectable modules would create an unnecessary distinction for teams that see TDD as part of the overall testing standard.

The framework also needed curated external skills so installations could reinforce testing decisions with reusable guidance for test design and Playwright usage.

## Decision

Aircury will use a single default-enabled `testing` standards module.

The `testing` module defines a practical testing pyramid with these defaults:

- TDD is included as part of the module through a red -> green -> refactor workflow
- frontend defaults to `Vitest`, `Testing Library`, and `Playwright` when the repository does not already standardise another stack
- backend services must always include unit tests and integration tests, regardless of language-specific framework choice
- end-to-end tests are reserved for critical user journeys and production wiring, not broad duplication of lower-level coverage

Aircury will also install a default `testing` skill group with these external skills:

- `supercent-io/skills-template@testing-strategies`
- `wshobson/agents@e2e-testing-patterns`
- `currents-dev/playwright-best-practices-skill@playwright-best-practices`

## Consequences

- New installations receive one coherent testing standard instead of separate TDD and testing toggles.
- Frontend projects get a clear default toolchain without forcing it over an already-established repository standard.
- Backend projects retain language flexibility while still enforcing unit and integration coverage expectations.
- Default skill installation now includes a dedicated testing bundle that complements the local module text with reusable external patterns.
