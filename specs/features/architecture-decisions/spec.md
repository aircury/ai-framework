### Requirement: Agents SHALL persist material architectural decisions as ADRs
The framework MUST require agents to create or update an ADR when a task introduces, changes, or supersedes a material architectural or workflow decision.

#### Scenario: A task introduces a new cross-cutting rule
- **WHEN** an agent defines a new rule that affects architecture, workflow governance, or delivery standards
- **THEN** the agent creates a new ADR under `specs/decisions/` that records the context, decision, and consequences

#### Scenario: A task changes an existing architectural direction
- **WHEN** an agent changes a previously recorded architectural or workflow decision
- **THEN** the agent creates a new ADR that references the superseded decision instead of silently rewriting history

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
