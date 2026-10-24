### 3. DDD Boundaries

Model behaviour, not tables or screens.

- Prefer aggregate-focused design over CRUD-first design.
- Use entities when identity matters.
- Use value objects when equality is structural and data must remain valid and immutable.
- Repositories are per aggregate root, not per table.
- Contexts meet through a contract in a shared kernel or through a domain event, never by importing each other. Calling another context's application service is such an import: a change inside one context then breaks the other, and the boundary can no longer be checked mechanically.

## Domain Modelling Rules

- Entities own behaviour and protect invariants.
- Value objects must be validated at creation time.
- Domain services are allowed only when behaviour does not naturally belong to an entity or value object.
- Application services orchestrate; they do not contain core business policy when that policy belongs in the domain.
- Domain events should use past-tense names and represent facts that already happened.

Anemic domain models are not acceptable unless the problem is truly trivial.
