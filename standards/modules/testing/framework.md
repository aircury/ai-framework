## Testing Strategy

Automated tests are required for behaviour that matters. The test suite should be fast at the bottom, realistic at the boundaries, and selective with full end-to-end coverage.

### TDD Workflow

Testing includes a red -> green -> refactor workflow by default.

Work in vertical slices:

1. Write one failing test for one observable behavior.
2. Implement the minimum code needed to pass.
3. Refactor while keeping tests green.
4. Repeat.

Do not batch all tests first. Do not batch all implementation first.

### Coverage Model

- Write unit tests for domain logic, pure functions, transformations, policies, and other isolated behaviour with meaningful branching.
- Write integration tests for application use cases, persistence adapters, HTTP handlers, messaging flows, and other boundary-crossing behaviour.
- Write end-to-end tests only for critical user journeys, production wiring, and regressions that cannot be trusted at lower levels alone.
- Prefer a balanced test pyramid over a top-heavy suite of slow UI tests.

### Frontend Defaults

When the project has a frontend, prefer this default toolchain unless the repository already standardises on something else:

- **Vitest** for unit and component-level execution.
- **Testing Library** for behaviour-driven UI tests through accessible queries.
- **Playwright** for browser-level end-to-end coverage.

Frontend testing rules:

- Test user-observable behaviour, not component internals.
- Prefer Testing Library queries by role, label, and visible text before falling back to test IDs.
- Keep Playwright focused on high-value journeys such as authentication, checkout, onboarding, critical CRUD flows, or cross-page regressions.
- Avoid large snapshot suites with low signal.

### Backend Defaults

Backend services must always include:

- **Unit tests** for domain behaviour and isolated business rules.
- **Integration tests** for adapters, data access, transport layers, and boundary contracts.

Language and framework-specific tools may vary by repository, but these expectations do not.

### Test Quality Rules

- Prefer real collaborators inside the boundary under test and mock only true external systems or uncontrollable side effects.
- Keep fixtures small and intention-revealing.
- Make regressions reproducible with a focused failing test before fixing the bug.
- Ensure tests can run reliably in CI without hidden local prerequisites.
- Do not ship features that only have manual verification when automated coverage is feasible.
