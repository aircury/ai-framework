# Use descriptive names for architecture decision records

- Status: Draft
- Date: 2026-08-05
- Amends: modular-framework-and-adrs

## Context

Sequential ADR numbers require contributors to coordinate through a shared counter.
When multiple people or agents create decisions in parallel, they can allocate the same number and produce unnecessary merge conflicts.
The number does not add enough value to justify that coordination cost.

## Decision

Architecture decision records will use a unique descriptive name derived from the decision itself.

ADR filenames will contain only that lowercase, hyphen-separated descriptive name and the `.md` extension.
ADR headings will contain only the human-readable decision title.
References between ADRs and Airsync tags will use the descriptive name rather than a sequence number.

Existing ADR files and headings will be migrated to the same convention without changing their recorded Context, Decision, or Consequences.

## Consequences

- Contributors can create unrelated ADRs in parallel without coordinating a shared sequence.
- File paths communicate the subject of each decision directly.
- ADR names must remain unique and should be chosen carefully because other records may reference them.
- Existing links and generated guidance must be updated as part of the migration.
