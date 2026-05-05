# Implementation Guide

This guide explains how to install Aircury AI Framework into a project and what the installer does behind the scenes.

## Install In A Project

Run the installer from the root of the repository you want to configure:

```bash
bunx @aircury/ai-framework
# or
npx @aircury/ai-framework
```

Choose `Local` when configuring the current project. The installer writes framework files into the current working directory and installs selected skills for the selected tools.

## Local Installation Flow

The TUI performs this sequence:

1. Select scope: `Local` or `Global`.
2. Select tool-specific integrations.
3. Choose whether generated rules should enforce British English for local installs.
4. Select capabilities.
5. Review files and `npx skills add` commands.
6. Confirm installation.
7. Choose whether to skip or overwrite existing generated files.
8. Write files, install skills, and update `.gitignore` with `specs/changes/`.

Universal agents such as Amp, Codex, Cursor, GitHub Copilot, Kilo Code, and OpenCode are supported through `AGENTS.md` and selected skills. Tool-specific files are added only when selected.

## Generated Files

| File | Purpose |
|---|---|
| `FRAMEWORK.md` | Governing project constitution generated from templates, with links to selected capability detail docs. |
| `AGENTS.md` | Short agent entrypoint that points to `FRAMEWORK.md`. Existing non-Aircury content is preserved by appending the framework reference. |
| `CLAUDE.md` | Claude Code instructions, when Claude Code is selected. |
| `GEMINI.md` | Gemini CLI instructions, when Gemini CLI is selected. |
| `.aircury/framework.config.json` | Installed profile with selected capabilities and language settings. |
| `docs/aircury/capabilities/*.md` | Detailed rules for selected capabilities that contribute framework or agent guidance. |
| `specs/features/README.md` | Starter guide for canonical living specifications. |
| `specs/decisions/README.md` | Starter ADR guide when `decision-records` is enabled. |
| `specs/ui/README.md` | Starter frontend design-system guide when `frontend` is enabled. |
| `specs/ui/frontend-workflow.md` | Frontend workflow reference when `frontend` is enabled. |
| `.gitignore` | Adds `specs/changes/` because workflow change artifacts are temporary. |

## Capabilities

Capabilities are defined in `src/capabilities.ts`. A capability is the unit users select in the installer. Each capability can contribute generated capability docs, generated files, installable skills, or any combination of those.

Some capabilities compose internal standard modules from `standards/modules/<module-id>/`. Those modules are implementation details, not separate installer choices.

Each content module contains:

- `module.json`: id, label, hint, description, and default state.
- `framework.md`: detailed framework rules written into the owning capability doc under `docs/aircury/capabilities/`.
- `agents.md`: concise operating instructions written into the owning capability doc.

The current built-in capabilities are:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `architecture`
- `decision-records`
- `testing`
- `code-style`
- `frontend`
- `token-efficiency`
- `resilience`
- `specs`
- `language`

For example, `architecture` includes the DDD and hexagonal architecture standard modules plus the curated `clean-ddd-hexagonal` skill. `testing` includes testing rules plus Playwright and E2E skills. `resilience` includes error-handling and structured-logging rules plus related skills.

The installer stores the selected capability ids in `.aircury/framework.config.json`. Re-run the installer or edit the profile and regenerate files if project standards need to change.

## Config Schema Migration

Version 1 config files used `modules` as the selectable unit. Version 2 config files use `capabilities`, which can compose standards modules, generated starter files, and installable skills.

The v2 shape is:

```json
{
  "version": 2,
  "capabilities": ["architecture", "decision-records", "testing"],
  "language": {
    "britishEnglish": false
  }
}
```

Use this compatibility mapping when migrating a v1 `.aircury/framework.config.json`:

| v1 module | v2 capability |
|---|---|
| `decision-records` | `decision-records` |
| `tdd` | `testing` |
| `testing` | `testing` |
| `hexagonal-architecture` | `architecture` |
| `ddd` | `architecture` |
| `code-style` | `code-style` |
| `airsync-memory` | `airsync` |
| `error-handling` | `resilience` |
| `structured-logging` | `resilience` |
| `frontend` | `frontend` |
| `token-efficiency` | `token-efficiency` |

The v2 capabilities `open-spec`, `spec-kit`, `git`, `specs`, and `language` have no direct v1 module equivalent because they represent workflow skills, source-of-truth spec helpers, or language preference rather than old standards modules.

When both `hexagonal-architecture` and `ddd` are present, migrate them once to `architecture`. When either `error-handling` or `structured-logging` is present, migrate it to `resilience` because that capability owns both operational standards in the current installer model.

## Skill Installation

Installable skills are defined on capabilities in `src/capabilities.ts`. The installer expands selected capabilities into individual skills and groups them by source before running `skills add` through `npx` when available, or `bunx` otherwise.

Local skill commands include the `universal` agent and any selected tool-specific agents. Global skill commands target only selected global tools.

The generated command shape is:

```bash
<npx|bunx> -y skills add <source> --skill <skill-name> -a <agent> -y
```

Global installs also add `-g`:

```bash
<npx|bunx> -y skills add <source> --skill <skill-name> -a <agent> -g -y
```

## Default Capabilities

Default selected capabilities are:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `resilience`
- `testing`
- `code-style`
- `frontend`
- `token-efficiency`
- `architecture`
- `specs`

Additional automatic selection:

- `language` is selected when British English is enabled.

## How Agents Should Use The Installed Framework

Agents should read `AGENTS.md` first, then `FRAMEWORK.md`. Safe fast-path tasks can proceed directly with focused verification only when they are trivial, low-risk, easily reversible, narrowly scoped, and do not change behavior, architecture, public APIs, dependencies, persistence, security, or operational failure paths. Complex, ambiguous, cross-cutting, architectural, risky, behavior-changing, or user-requested routed work uses the meta-agent routing flow before implementation.

All workflow modes converge on `specs/features/`:

- `plan-build` can update specs directly after behavior changes.
- OpenSpec flows use temporary artifacts in `specs/changes/<name>/` and then sync final behavior into `specs/features/`.
- Spec Kit flows create formal artifacts before implementation and still finish by updating `specs/features/`.

## Conflict Handling

Before writing files, the installer checks whether generated files already exist.

If conflicts are found, the user chooses:

- `Skip existing`: only write files that do not exist. `AGENTS.md` is still safely merged with the framework reference.
- `Overwrite all`: replace generated files with the new rendered content.

The installer never deletes project code.

## Next Step

For practical workflow examples and real use cases, see [`playbook.md`](playbook.md).
