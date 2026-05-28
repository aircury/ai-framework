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
| `FRAMEWORK.md` | Full project constitution generated from templates and selected capabilities. |
| `AGENTS.md` | Short agent entrypoint that points to `FRAMEWORK.md`. Existing non-Aircury content is preserved by appending the framework reference. |
| `CLAUDE.md` | Claude Code instructions, when Claude Code is selected. Existing non-Aircury content is preserved by appending the framework reference. |
| `.cursorrules` | Cursor rules, when Cursor is selected. Existing content is preserved by appending Aircury commit rules. |
| `GEMINI.md` | Gemini CLI instructions, when Gemini CLI is selected. |
| `.aircury/framework.config.json` | Installed profile with selected capabilities and language settings. |
| `specs/features/README.md` | Starter guide for canonical living specifications. |
| `specs/decisions/README.md` | Starter ADR guide when `decision-records` is enabled. |
| `specs/ui/README.md` | Starter frontend design-system guide when `frontend` is enabled. |
| `specs/ui/frontend-workflow.md` | Frontend workflow reference when `frontend` is enabled. |
| `.gitignore` | Adds `specs/changes/` because workflow change artifacts are temporary. |

## Capabilities

Capabilities are defined in `src/capabilities.ts`. A capability is the unit users select in the installer. Each capability can contribute generated framework content, generated files, installable skills, or any combination of those.

Capabilities are additive. Local installations always include core engineering non-negotiables in `FRAMEWORK.md`, even when optional capabilities are not selected: TDD where automated testing is feasible, SOLID design constraints, Clean Code, explicit architecture boundaries, and explicit justification for safe exceptions.

Some capabilities compose internal standard modules from `standards/modules/<module-id>/`. Those modules are implementation details, not separate installer choices.

Each content module contains:

- `module.json`: id, label, hint, description, and default state.
- `framework.md`: rules added to `FRAMEWORK.md`.
- `agents.md`: concise operating instructions added to agent rules.

The current built-in capabilities are:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `aircury-aws-sso`
- `ddd-hexagonal`
- `clean-architecture`
- `layered-architecture`
- `decision-records`
- `testing`
- `code-style`
- `frontend`
- `token-efficiency`
- `resilience`
- `specs`
- `language`

For example, the architecture capabilities install one selected architecture standard. `ddd-hexagonal` includes the DDD+Hexagonal standard modules plus the curated `clean-ddd-hexagonal` skill. `custom-architecture` installs a discovery skill that analyses the repository and writes the project-specific architecture section to `FRAMEWORK.local.md`. `testing` includes testing rules plus Playwright and E2E skills. `resilience` includes error-handling and structured-logging rules plus related skills. `specs` includes skills for extracting behaviour specs, interpreting specs, applying semantic line breaks, and using DBML as the standard for database schema documentation in `db/schema.dbml`.

The installer stores the selected capability ids in `.aircury/framework.config.json`. Re-run the installer or edit the profile and regenerate files if project standards need to change.

## Skill Installation

Installable skills are defined on capabilities in `src/capabilities.ts`. The installer expands selected capabilities into individual skills and groups them by source before running `skills add` through `npx` when available, or `bunx` otherwise.

Local skill commands include the `universal` agent and any selected tool-specific agents except Claude Code. Global skill commands include `universal` and selected global tool agents.

When Claude Code is selected for a local install, the installer materialises selected skills through the `universal` agent and then synchronises available selected skills from `.agents/skills/` into `.claude/skills/` so Claude Code can load them from its project-specific skills directory. This avoids asking `skills add` and the installer to manage the same Claude Code target directory. If a selected skill was not materialised by `skills add`, the installer reports a warning instead of failing the project installation.

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
- `ddd-hexagonal`
- `specs`

Additional automatic selection:

- `language` is selected when British English is enabled.

Architecture is selected interactively and is not part of the default non-interactive profile.

## How Agents Should Use The Installed Framework

Agents should read `AGENTS.md` first, then `FRAMEWORK.md`. For non-trivial changes, the generated framework instructs them to act as a routing meta-agent before implementing.

All workflow modes converge on `specs/features/`:

- `plan-build` can update specs directly after behavior changes.
- OpenSpec flows use temporary artifacts in `specs/changes/<name>/` and then sync final behavior into `specs/features/`.
- Spec Kit flows create formal artifacts before implementation and still finish by updating `specs/features/`.

## Conflict Handling

Before writing files, the installer checks whether generated files already exist.

If conflicts are found, the user chooses:

- `Skip existing`: only write files that do not exist. `AGENTS.md` and `CLAUDE.md` are still safely merged with the framework reference.
- `Overwrite all`: replace generated files with the new rendered content.

The installer never deletes project code.

## Next Step

For practical workflow examples and real use cases, see [`playbook.md`](playbook.md).
