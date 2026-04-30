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
3. Select standards modules for local installs.
4. Choose whether generated rules should enforce British English.
5. Select skill groups.
6. Review files and `npx skills add` commands.
7. Confirm installation.
8. Choose whether to skip or overwrite existing generated files.
9. Write files, install skills, and update `.gitignore` with `specs/changes/`.

Universal agents such as Amp, Codex, Cursor, GitHub Copilot, Kilo Code, and OpenCode are supported through `AGENTS.md` and selected skills. Tool-specific files are added only when selected.

## Generated Files

| File | Purpose |
|---|---|
| `FRAMEWORK.md` | Full project constitution generated from templates and selected standards modules. |
| `AGENTS.md` | Short agent entrypoint that points to `FRAMEWORK.md`. Existing non-Aircury content is preserved by appending the framework reference. |
| `CLAUDE.md` | Claude Code instructions, when Claude Code is selected. |
| `GEMINI.md` | Gemini CLI instructions, when Gemini CLI is selected. |
| `.aircury/framework.config.json` | Installed profile with selected modules and language settings. |
| `specs/features/README.md` | Starter guide for canonical living specifications. |
| `specs/decisions/README.md` | Starter ADR guide when `decision-records` is enabled. |
| `specs/ui/README.md` | Starter frontend design-system guide when `frontend` is enabled. |
| `.gitignore` | Adds `specs/changes/` because workflow change artifacts are temporary. |

## Standards Modules

Standards modules live under `standards/modules/<module-id>/` and are composed into generated framework files.

Each module contains:

- `module.json`: id, label, hint, description, and default state.
- `framework.md`: rules added to `FRAMEWORK.md`.
- `agents.md`: concise operating instructions added to agent rules.

The current built-in module ids are:

- `decision-records`
- `frontend`
- `hexagonal-architecture`
- `ddd`
- `code-style`
- `airsync-memory`
- `error-handling`
- `structured-logging`
- `testing`
- `token-efficiency`

The installer stores the selected module ids in `.aircury/framework.config.json`. Re-run the installer or edit the profile and regenerate files if project standards need to change.

## Skill Installation

Skill groups are defined in `src/skills-catalog.ts`. The installer expands selected groups into individual skills and groups them by source before running `npx skills add`.

Local skill commands include the `universal` agent and any selected tool-specific agents. Global skill commands target only selected global tools.

The generated command shape is:

```bash
npx -y skills add <source> --skill <skill-name> -a <agent> -y
```

Global installs also add `-g`:

```bash
npx -y skills add <source> --skill <skill-name> -a <agent> -g -y
```

## Default Skill Groups

Default selected groups are:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `resilience`
- `testing`
- `architecture`
- `specs`

Additional automatic selections:

- `language` is selected when British English is enabled.
- `frontend` is selected when the `frontend` standards module is enabled.
- `token-efficiency` is selected when the `token-efficiency` standards module is enabled.

## How Agents Should Use The Installed Framework

Agents should read `AGENTS.md` first, then `FRAMEWORK.md`. For non-trivial changes, the generated framework instructs them to act as a routing meta-agent before implementing.

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
