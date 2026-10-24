### Requirement: Code style guidance SHALL be installable as a framework module
The installer MUST support enabling code style guidance as a configurable standards module that applies to any language.

#### Scenario: Code style guidance is enabled during installation
- **WHEN** the user selects the code style capability
- **THEN** generated framework instructions tell agents to discover the configured linters, formatters and type checkers for every language and sub-project a change touches, not only those of one ecosystem

### Requirement: Agents SHALL follow the project's own code style tooling
The framework MUST require agents to check code with the tools and conventions the project already configures, through the project's own entry point when one exists.

#### Scenario: The project provides a lint entry point
- **WHEN** a change touches code in a project that documents or defines a single command for its checks
- **THEN** the agent runs the checks through that command instead of invoking the underlying tools directly

#### Scenario: The project has no tool configured for a language
- **WHEN** a change touches a language the project configures no tool for
- **THEN** the agent matches the existing code and editor conventions and introduces no new tool, configuration or style unless the user asks for it
