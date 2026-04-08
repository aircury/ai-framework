## TDD Workflow

TDD is required by default for this installation profile.

### Red -> Green -> Refactor

Work in vertical slices:

1. Write one failing test for one observable behavior.
2. Implement the minimum code needed to pass.
3. Refactor while keeping tests green.
4. Repeat.

Do not batch all tests first. Do not batch all implementation first.

### Test Rules

- Test behavior through public interfaces.
- Prefer integration-style tests for use cases and adapters where practical.
- Avoid testing private methods or internal implementation details.
- Avoid brittle mocks for code you own.
- Mock only true external boundaries or uncontrollable collaborators.
- Each test should read like a specification of business behavior.

Good targets for tests:

- Use case outcomes.
- Domain invariants.
- Aggregate behavior.
- Mapping between adapters and application ports.
- Regression coverage for bugs.

Weak targets:

- Internal helper implementation details.
- Framework internals.
- Snapshot-heavy tests with low behavioral signal.
