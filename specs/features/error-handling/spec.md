### Requirement: Error handling guidance SHALL be installable as a framework module
The installer MUST support enabling error handling guidance as a configurable standards module.

#### Scenario: Error handling guidance is enabled during installation
- **WHEN** the user selects the error handling module
- **THEN** generated framework instructions include rules for classifying failures, handling operational errors safely, and failing fast on programmer errors

### Requirement: Agents SHALL classify failures before handling them
The framework MUST require agents to distinguish between operational errors and programmer errors before selecting a response strategy.

#### Scenario: A task introduces a failure path at a system boundary
- **WHEN** an agent adds or changes code that can fail due to invalid input, unavailable dependencies, or timeouts
- **THEN** the agent handles that failure as an operational error with a safe external response and internal diagnostic context

#### Scenario: A task discovers an invariant violation or impossible state
- **WHEN** an agent encounters or introduces a programmer error condition
- **THEN** the agent treats it as a bug, preserves diagnostic context, and does not mask it as a normal success path
