### Requirement: Agents SHALL persist material architectural decisions as ADRs
The framework MUST require agents to create a new ADR when a task introduces, changes, amends, or supersedes a material architectural or workflow decision.

#### Scenario: A task introduces a new cross-cutting rule
- **WHEN** an agent defines a new rule that affects architecture, workflow governance, or delivery standards
- **THEN** the agent creates a new ADR under `specs/decisions/` that records the context, decision, and consequences

### Requirement: ADRs SHALL use descriptive names without sequence numbers
The framework MUST identify each ADR by a unique descriptive name derived from the decision rather than by a sequence number, timestamp, or other shared counter.

#### Scenario: An agent creates an ADR
- **WHEN** an agent records a decision named "Use Redis-backed sessions"
- **THEN** the ADR is stored as `specs/decisions/use-redis-backed-sessions.md`
- **AND** its heading contains the decision title without a numeric identifier

#### Scenario: Agents create ADRs in parallel
- **WHEN** multiple agents create ADRs concurrently
- **THEN** each agent chooses a unique descriptive name for its decision
- **AND** no agent reads or updates a shared sequence to allocate the name

#### Scenario: A task changes an existing architectural direction
- **WHEN** an agent changes a previously recorded architectural or workflow decision
- **THEN** the agent creates a new ADR with `Supersedes: <decision-name>` if the new decision completely replaces or invalidates the old one
- **AND** the agent creates a new ADR with `Amends: <decision-name>` if the new decision only modifies, clarifies, or adds to the old one without completely invalidating it

### Requirement: Agents SHALL treat non-draft ADRs as immutable
The framework MUST require agents to edit ADRs only while their status is exactly `Draft`.

#### Scenario: A task attempts to alter a non-draft ADR
- **GIVEN** an ADR has a status other than `Draft`, no status, or an unknown status
- **WHEN** an agent detects that the recorded decision needs to change
- **THEN** the agent creates a new ADR with `Supersedes: <decision-name>` if the new decision completely replaces or invalidates the old one
- **AND** the agent creates a new ADR with `Amends: <decision-name>` if the new decision only modifies, clarifies, or adds to the old one without completely invalidating it
- **AND** the agent updates the prior ADR only to state that it has changed and that the changes are recorded in the new ADR
- **AND** the agent does not modify the prior ADR's original Context, Decision, Reason, or Consequences

#### Scenario: A draft ADR is refined before acceptance
- **GIVEN** an ADR has `Status: Draft`
- **WHEN** the decision is still being developed
- **THEN** the agent may update that draft ADR in place

#### Scenario: A draft ADR is modified
- **GIVEN** an ADR has `Status: Draft`
- **WHEN** an agent modifies the draft ADR
- **THEN** the agent asks the user whether they want to publish it now
- **AND** the ADR remains `Draft` unless the user explicitly confirms publication

#### Scenario: The user confirms the change is complete
- **GIVEN** an ADR has `Status: Draft`
- **WHEN** the user explicitly confirms that the functionality or change is complete
- **AND** the user explicitly confirms that the ADR should be published now
- **THEN** the agent may change the ADR status from `Draft` to `Accepted`

#### Scenario: Publication confirmation is absent
- **GIVEN** an ADR has `Status: Draft`
- **WHEN** the user does not explicitly confirm that the ADR should be published now
- **THEN** the agent keeps `Status: Draft`

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

### Requirement: Agents SHALL dual-write ADRs to Airsync memory
The framework MUST require agents to propose every ADR created or superseded to Airsync as a team-scoped memory entry.

#### Scenario: A new ADR is created
- **WHEN** an agent creates an ADR under `specs/decisions/`
- **THEN** the agent proposes a corresponding entry to Airsync INBOX with `memory_kind: "note"`, `scope: "team"`, and tags including `"adr"` and the descriptive ADR name

#### Scenario: An existing ADR is superseded
- **WHEN** an agent supersedes an ADR by creating a new one
- **THEN** the agent proposes the new ADR to Airsync INBOX and archives the superseded ADR's corresponding memory if it exists
