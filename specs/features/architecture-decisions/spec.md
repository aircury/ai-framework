### Requirement: Agents SHALL persist current material architectural decisions as ADRs
The framework MUST require agents to create an ADR when a task introduces a material architectural or workflow decision.
The framework MUST require agents to revise that ADR when the decision evolves.

#### Scenario: A task introduces a new cross-cutting rule
- **WHEN** an agent defines a new rule that affects architecture, workflow governance, or delivery standards
- **THEN** the agent creates an ADR under `specs/decisions/` with context, decision, and consequences

#### Scenario: A task changes an existing architectural direction
- **WHEN** an agent changes a recorded architectural or workflow decision
- **THEN** the agent revises the existing ADR to reflect the current decision

### Requirement: ADRs SHALL use descriptive names and explicit paths
The framework MUST identify each ADR by a unique descriptive name derived from the decision.
ADR links MUST use explicit repository-relative Markdown paths.

#### Scenario: An agent creates an ADR
- **WHEN** an agent records a decision named "Use Redis-backed sessions"
- **THEN** the ADR is stored as `specs/decisions/use-redis-backed-sessions.md`
- **AND** its heading contains the decision title without an identifier

#### Scenario: An agent links to an ADR
- **WHEN** an agent references the Redis-backed sessions decision
- **THEN** it uses `[Use Redis-backed sessions](specs/decisions/use-redis-backed-sessions.md)`

#### Scenario: Agents create ADRs in parallel
- **WHEN** multiple agents create ADRs concurrently
- **THEN** each agent chooses a unique descriptive name for its decision
- **AND** no agent reads or updates a shared counter to allocate the name

### Requirement: Agents SHALL consult relevant ADRs before changing governed areas
The framework MUST require agents to read relevant ADRs before implementing work in an area governed by prior decisions.

#### Scenario: A task touches an area with recorded decisions
- **WHEN** an agent starts work on a feature or workflow area with related ADRs
- **THEN** the agent reviews those ADRs before implementation

### Requirement: ADR guidance SHALL be installable as a framework module
The installer MUST support enabling ADR governance as a configurable standards module.

#### Scenario: ADR governance is enabled during installation
- **WHEN** the user selects the ADR module
- **THEN** generated framework instructions include ADR creation and review rules
