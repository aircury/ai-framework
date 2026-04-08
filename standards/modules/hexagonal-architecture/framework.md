## Non-Negotiable Architecture Rules

### 1. Dependency Rule

Dependencies must point inward only:

`infrastructure -> application -> domain`

Never invert this rule.

Forbidden examples:

- Domain code importing HTTP, ORM, UI, framework, or external SDK libraries.
- Controllers, routes, handlers, or UI components calling repositories directly.
- Infrastructure types leaking into domain entities or use cases.

Required approach:

- Domain contains business rules, invariants, entities, value objects, domain services, and domain events.
- Application contains use cases, commands/queries, orchestration, and ports.
- Infrastructure contains adapters for persistence, HTTP, auth providers, email, external APIs, and framework glue.

### 2. Hexagonal Ports and Adapters

Every external dependency must sit behind a port when it affects business behavior.

Examples:

- Persistence adapters implement repository ports.
- Email delivery implements a notification or mailer port.
- Auth providers implement authentication ports.
- UI and HTTP handlers act as driving adapters and call use cases.

Framework code is an adapter, never the core.
