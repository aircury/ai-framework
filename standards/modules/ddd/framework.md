### 3. DDD Boundaries

Model behavior, not tables or screens.

- Prefer aggregate-focused design over CRUD-first design.
- Use entities when identity matters.
- Use value objects when equality is structural and data must remain valid and immutable.
- Repositories are per aggregate root, not per table.
- Cross-context communication should happen through explicit application services or domain events, not hidden imports.

## Domain Modeling Rules

- Entities own behavior and protect invariants.
- Value objects must be validated at creation time.
- Domain services are allowed only when behavior does not naturally belong to an entity or value object.
- Application services orchestrate; they do not contain core business policy when that policy belongs in the domain.
- Domain events should use past-tense names and represent facts that already happened.

Anemic domain models are not acceptable unless the problem is truly trivial.
