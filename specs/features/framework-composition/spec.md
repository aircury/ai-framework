### Requirement: The framework SHALL separate core workflow rules from optional standards modules
The installer MUST generate a core framework constitution and compose additional standards rules from explicitly selected modules.

#### Scenario: A project installs the framework with custom standards
- **WHEN** the user selects a subset of available standards during installation
- **THEN** the generated framework includes only the selected optional standards alongside the shared core rules

### Requirement: The installer SHALL persist selected standards for future maintenance
The installer MUST write the selected standards to a versioned configuration file in the project.

#### Scenario: Installation completes with a custom profile
- **WHEN** the framework is installed locally
- **THEN** the project contains a machine-readable configuration file that records the enabled standards modules

### Requirement: The standards system SHALL be extensible
The framework MUST represent standards as a registry so that new modules can be added without redesigning the installer or template generation flow.

#### Scenario: A new standards module is added
- **WHEN** maintainers register a new standards module
- **THEN** the installer prompt and generated framework content can include it through the shared composition system

### Requirement: Standards modules SHALL be content packages with metadata
The framework MUST store each standards module as content plus machine-readable metadata instead of embedding module rules directly in application code.

#### Scenario: A maintainer adds or edits a standards module
- **WHEN** a maintainer updates a module
- **THEN** the normative text lives in module content files and the selection metadata lives in a module manifest

### Requirement: Generated documents SHALL use dedicated templates
The framework MUST render generated files from dedicated template files instead of assembling full documents through large inline strings in TypeScript.

#### Scenario: A maintainer changes the document shell
- **WHEN** a maintainer changes the shared structure of `FRAMEWORK.md` or `AGENTS.md`
- **THEN** the change is made in a dedicated template file and module content is injected through the renderer
