## Clean Architecture Rules

### 1. Dependency Rule

Source code dependencies must point inward only:

`frameworks/drivers -> interface adapters -> use cases -> entities`

Never invert this rule.

Forbidden examples:

- Entities importing HTTP, ORM, UI, framework, database, queue, SDK, or vendor-specific libraries.
- Use cases depending on controllers, presenters, routes, persistence models, framework request/response objects, or concrete infrastructure adapters.
- Interface adapters leaking external DTOs, ORM records, or transport-specific types into use cases or entities.
- Framework and driver decisions changing entity or use-case code.

### 2. Layer Responsibilities

Keep responsibilities explicit:

- Entities contain enterprise business rules, invariants, domain concepts, and behaviour that should survive framework and delivery changes.
- Use cases contain application-specific business rules, orchestrate entities, define ports, and express input/output boundaries in application terms.
- Interface adapters convert data between external shapes and use-case/entity shapes. Controllers, presenters, gateways, mappers, and repository implementations live here.
- Frameworks and drivers contain technical details such as the web framework, database engine, UI framework, queues, file system, auth provider, and third-party SDKs.

### 3. Boundary Contracts

Use cases must depend on stable contracts owned by the inner layers, not concrete details owned by outer layers.

Required approach:

- Define input models, output models, and ports in application or domain language.
- Implement adapters outside the use-case and entity layers.
- Map external requests, database rows, ORM models, and API responses at the adapter boundary.
- Keep transaction handling, routing, serialization, dependency injection, and framework bootstrapping outside entities and use cases.

### 4. Replaceable Details

Technical changes must not force core changes.

Acceptable outcomes:

- Replacing MySQL with MongoDB changes persistence adapters and composition code, not entities or use cases.
- Replacing REST with GraphQL changes controllers, resolvers, presenters, and transport mappings, not entities or use cases.
- Replacing a framework such as Express, Spring, React, or a queue provider changes drivers and adapters, not core business rules.
