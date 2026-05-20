---
name: custom-architecture
description: Analyse a repository's real architecture and write or refresh the Project Architecture section in FRAMEWORK.local.md for projects using the Custom Architecture capability.
---

# Custom Architecture Discovery

Use this skill when a project selected the `custom-architecture` capability, or when the user asks to analyse the repository architecture and record the findings in `FRAMEWORK.local.md`.

## Goal

Discover the architecture that actually exists in the repository and persist concise, actionable guidance for future agents in `FRAMEWORK.local.md`.

Do not force DDD, Hexagonal, Clean Architecture, or Layered Architecture terminology unless the codebase clearly uses those patterns.

## Workflow

1. Read `FRAMEWORK.md` and existing `FRAMEWORK.local.md` when present.
2. Inspect the repository structure before editing:
   - Package manifests and workspace files.
   - Source directories and feature/module boundaries.
   - Application entrypoints, routing, API, UI, persistence, background jobs, and tests.
   - Import/dependency direction between folders.
   - Configuration files that reveal frameworks, build systems, or runtime boundaries.
3. Summarise only discoveries supported by files in the repository.
4. Write or replace the managed section in `FRAMEWORK.local.md`:

```md
## Project Architecture

<!-- aircury-custom-architecture:start -->
...
<!-- aircury-custom-architecture:end -->
```

5. Preserve all content outside the managed markers exactly.
6. If an existing `## Project Architecture` section has unmarked human-authored content, keep it and append the managed block below it.

## Required Output Structure

Inside the managed block, use this structure:

```md
### Architecture Summary

<Short description of the observed architecture.>

### Directory Responsibilities

- `<path>`: <responsibility>

### Dependency And Boundary Rules

- <Observed rule future agents must follow.>

### Implementation Conventions

- <Naming, file placement, testing, framework, or integration convention.>

### Risks And Open Questions

- <Risk, inconsistency, or question. Use `None discovered.` when applicable.>
```

## Quality Rules

- Be descriptive, not aspirational. Record what the project does, not what it should do.
- Include enough detail that a future agent can place new code correctly.
- Prefer paths and concrete boundaries over vague labels.
- Mark uncertainty explicitly instead of guessing.
- Do not edit generated `FRAMEWORK.md`.
- Do not rewrite unrelated `FRAMEWORK.local.md` content.
