### Requirement: The framework SHALL separate core workflow rules from installable capabilities
The installer MUST generate a core framework constitution and compose additional rules and workflows from explicitly selected capabilities.

#### Scenario: A project installs the framework with custom capabilities
- **WHEN** the user selects a subset of available capabilities during installation
- **THEN** the generated framework includes only the selected capability rules alongside the shared core rules

### Requirement: The installer SHALL persist selected capabilities for future maintenance
The installer MUST write the selected capabilities to a versioned configuration file in the project.

#### Scenario: Installation completes with a custom profile
- **WHEN** the framework is installed locally
- **THEN** the project contains a machine-readable configuration file that records the enabled capabilities

### Requirement: The capability system SHALL be extensible
The framework MUST represent capabilities as a registry so that new capabilities can be added without redesigning the installer or template generation flow.

#### Scenario: A new capability is added
- **WHEN** maintainers register a new capability
- **THEN** the installer prompt and generated framework content can include it through the shared composition system

### Requirement: Capabilities SHALL be declarative packages with metadata
The framework MUST store each capability as metadata plus optional content, files, and installable skills instead of embedding capability rules directly in application code.

#### Scenario: A maintainer adds or edits a capability
- **WHEN** a maintainer updates a capability
- **THEN** the normative text and installation metadata live in the capability registry and referenced content files

### Requirement: Generated documents SHALL use dedicated templates
The framework MUST render generated files from dedicated template files instead of assembling full documents through large inline strings in TypeScript.

#### Scenario: A maintainer changes the document shell
- **WHEN** a maintainer changes the shared structure of `FRAMEWORK.md` or `AGENTS.md`
- **THEN** the change is made in a dedicated template file and capability content is injected through the renderer
