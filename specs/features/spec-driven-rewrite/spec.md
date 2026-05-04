### Requirement: Legacy extraction SHALL produce canonical feature specifications
The specs extraction skill MUST write extracted legacy behavior primarily as canonical feature specs under `specs/features/<capability-name>/spec.md` using requirement and scenario blocks.

#### Scenario: A legacy bounded context is extracted
- **WHEN** an agent extracts observable behavior from a legacy bounded context or cohesive source-file group
- **THEN** the agent writes the extracted behavior to `specs/features/<capability-name>/spec.md` as `### Requirement` blocks with `#### Scenario` entries
- **AND** each scenario contains `- **WHEN**` and `- **THEN**` assertions with exact triggers, inputs, state, outputs, errors, and side effects

#### Scenario: Supporting extraction notes are needed
- **WHEN** an agent needs to preserve concept maps, persistence contracts, risks, or rewrite boundaries during legacy extraction
- **THEN** the agent writes those details as supporting artifacts under `specs/`
- **AND** those supporting artifacts do not replace the canonical behavior in `specs/features/<capability-name>/spec.md`

### Requirement: Legacy extraction SHALL prefer precise scenarios over prose
The specs extraction skill MUST convert discovered behavior into directly testable `WHEN` / `THEN` scenarios instead of long narrative descriptions.

#### Scenario: A discovered behavior can be expressed as a scenario
- **WHEN** an agent discovers a use case, invariant, validation rule, authorisation rule, failure mode, side effect, or compatibility-sensitive persistence behavior
- **THEN** the agent represents that behavior as one or more scenarios in the relevant feature spec
- **AND** the agent does not leave the behavior only as explanatory prose, a concept catalog, or an implementation note

#### Scenario: A scenario has a vague result
- **WHEN** a drafted scenario result only says that an action succeeds, is handled, is processed, or is created
- **THEN** the agent rewrites the result to name the exact observable output, persisted state changes, unchanged state, errors, and triggered or absent side effects

### Requirement: Legacy extraction SHALL support bounded-context precision
The specs extraction skill MUST partition large legacy projects into bounded extraction units before writing final canonical specs.

#### Scenario: A legacy project has multiple capability areas
- **WHEN** an agent starts extracting specs from a legacy project with multiple route areas, database table groups, permission areas, background workflows, integrations, or frontend capability flows
- **THEN** the agent identifies bounded extraction units and maps each unit to a target `specs/features/<capability-name>/spec.md` file
- **AND** the agent records inspected source scope, touched persistence or external contracts, expected use cases, and unresolved dependencies for each unit

#### Scenario: The user authorises subagent extraction
- **WHEN** the user explicitly authorises subagents for legacy extraction and the runtime supports subagents
- **THEN** the lead agent assigns each subagent one bounded context or cohesive file group
- **AND** the lead agent merges, deduplicates, and reconciles subagent findings into canonical feature specs before writing `specs/features/<capability-name>/spec.md`

#### Scenario: The user authorises specialised subagent extraction
- **WHEN** the user explicitly authorises subagents for a broad or high-risk bounded context and the runtime supports subagents
- **THEN** the lead agent assigns relevant specialised extraction lenses for domain behavior, API contracts, persistence contracts, authorisation, validation and errors, side effects and async workflows, and frontend behavior
- **AND** the lead agent reconciles conflicts between specialised findings before writing canonical feature specs

### Requirement: Legacy extraction SHALL complete a coverage matrix before declaring code dispensable
The specs extraction skill MUST verify every bounded context against a mandatory coverage matrix before treating the legacy code as replaceable.

#### Scenario: A bounded context contains an operation or workflow
- **WHEN** an agent extracts an operation, workflow, state transition, integration event, scheduled task, or business invariant
- **THEN** the agent verifies coverage for happy path, input contract, output contract, persistence reads and writes, database enforcement, authorisation, state rules, failure modes, side effects, concurrency and idempotency, configuration, time behavior, compatibility quirks, and evidence
- **AND** every applicable coverage item is represented by one or more precise scenarios in `specs/features/<capability-name>/spec.md`

#### Scenario: A coverage area does not apply
- **WHEN** a coverage area is not relevant to a bounded context
- **THEN** the agent records the area as not applicable in supporting extraction notes with the reason
- **AND** the agent does not silently skip that coverage area

#### Scenario: A coverage area cannot be fully verified
- **WHEN** an applicable coverage area cannot be proven from code, schema, tests, fixtures, docs, or runtime behavior
- **THEN** the agent records the missing behavior in `specs/risks.md` with a risk level and evidence
- **AND** any related canonical requirement or scenario is marked INFERRED or UNCERTAIN instead of being presented as verified behavior

### Requirement: Spec interpretation SHALL validate canonical scenario fitness before design
The specs interpreter skill MUST verify that `specs/features/` contains precise requirement and scenario coverage before architecture design or implementation planning.

#### Scenario: Canonical feature specs are precise enough to drive a rewrite
- **WHEN** an agent interprets a spec set whose capabilities contain requirements with precise `WHEN` / `THEN` scenarios and completed coverage for happy paths, failures, validation, authorisation, state transitions, integrations, side effects, persistence, concurrency, configuration, time behavior, compatibility quirks, and evidence
- **THEN** the agent treats `specs/features/` as the authoritative behavior source for design and implementation planning
- **AND** supporting artifacts such as persistence, risk, rewrite-boundary, ADR, diagram, or note files are used only as clarifying context

#### Scenario: Canonical feature specs are too narrative or incomplete
- **WHEN** an agent interprets a spec set whose required behavior is mostly narrative, use-case prose, concept catalogs, implementation notes, vague scenario outcomes, or incomplete coverage matrix results
- **THEN** the agent stops before architecture design and identifies the affected capabilities as needing spec hardening
- **AND** the agent recommends running or re-running specs extraction for the affected bounded contexts unless the user explicitly chooses to proceed with marked assumptions

#### Scenario: The user authorises subagent spec review
- **WHEN** the user explicitly authorises subagents for interpreting a spec set that spans multiple capabilities and the runtime supports subagents
- **THEN** the lead agent assigns each subagent a bounded context or capability group to assess requirement coverage, weak scenarios, and compatibility risks
- **AND** the lead agent reconciles those assessments into a single spec fitness result before continuing to architecture design
