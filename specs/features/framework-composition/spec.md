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

### Requirement: Local reconfiguration SHALL preserve the installed selection state
The installer MUST initialise local reconfiguration choices from the project's valid saved configuration when one exists.
It MUST use registry defaults only when no valid saved configuration is available.

#### Scenario: A project reruns the installer after deselecting default capabilities
- **GIVEN** the saved project configuration omits capabilities that the registry selects by default
- **WHEN** the user starts a local reconfiguration
- **THEN** those omitted capabilities are initially unticked
- **AND** the capabilities recorded in the saved configuration are initially ticked

#### Scenario: A project reruns the installer with a saved architecture
- **GIVEN** the saved project configuration records one architecture capability
- **WHEN** the user starts a local reconfiguration
- **THEN** the recorded architecture is the initially focused architecture choice

#### Scenario: A project reruns the installer after selecting additional tools
- **GIVEN** the saved project configuration records the selected additional tools
- **WHEN** the user starts a local reconfiguration
- **THEN** only the recorded additional tools are initially ticked

#### Scenario: A legacy saved configuration does not record additional tools
- **GIVEN** a valid saved project configuration created before tool selections were persisted
- **WHEN** the user starts a local reconfiguration
- **THEN** the installer uses the default additional-tool selections

#### Scenario: The saved project configuration is missing or invalid
- **WHEN** the user starts a local reconfiguration without a valid saved project configuration
- **THEN** the installer initialises capabilities and additional tools from their registry defaults

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

### Requirement: Architecture capabilities SHALL be mutually exclusive
The installer MUST allow a project to select only one architecture standard capability at a time.

#### Scenario: A project starts interactive installation
- **WHEN** the user runs the interactive installer
- **THEN** the installer requires an explicit architecture capability choice without preselecting or recommending any architecture

#### Scenario: A project selects one architecture standard interactively
- **WHEN** the user selects more than one architecture capability during installation
- **THEN** the installer asks the user to choose one architecture capability before files or commands are generated

#### Scenario: A default profile is resolved outside the interactive installer
- **WHEN** default capabilities are resolved without an explicit architecture capability
- **THEN** no architecture capability, architecture rules, or architecture skills are included

#### Scenario: A saved profile contains incompatible architecture capabilities
- **WHEN** capability resolution receives multiple architecture capabilities such as `ddd-hexagonal`, `clean-architecture`, and `layered-architecture`
- **THEN** the resolved capability set contains only one architecture capability

### Requirement: Generated documents SHALL use dedicated templates
The framework MUST render generated files from dedicated template files instead of assembling full documents through large inline strings in TypeScript.

#### Scenario: A maintainer changes the document shell
- **WHEN** a maintainer changes the shared structure of `FRAMEWORK.md` or `AGENTS.md`
- **THEN** the change is made in a dedicated template file and capability content is injected through the renderer
