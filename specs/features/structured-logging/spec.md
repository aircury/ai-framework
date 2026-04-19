### Requirement: Structured logging guidance SHALL be installable as a framework module
The installer MUST support enabling structured logging guidance as a configurable standards module.

#### Scenario: Structured logging guidance is enabled during installation
- **WHEN** the user selects the structured logging module
- **THEN** generated framework instructions include rules for structured events, correlation fields, and sensitive data exclusion

### Requirement: Agents SHALL produce structured diagnostic events
The framework MUST require agents to prefer structured, machine-readable logs over ad hoc free-form logging.

#### Scenario: A task adds logging for a request or workflow step
- **WHEN** an agent introduces or changes logging around a meaningful operation
- **THEN** the logging uses a consistent structured event shape with operation context and correlation identifiers when available

#### Scenario: A task touches sensitive operational data
- **WHEN** an agent adds or reviews logging in code that handles credentials, tokens, personal data, or payloads
- **THEN** the agent omits or redacts that sensitive data from logs
