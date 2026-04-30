# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

Aircury AI Framework is a meta-framework for AI-assisted software engineering. It installs project rules, agent instructions, living specification folders, optional engineering standards, and curated skill groups so AI agents can plan, implement, verify, and document work consistently.

The framework combines a small core workflow constitution with installable standards modules. The canonical source of truth for behavior is always `specs/features/`, regardless of whether a task uses `plan-build`, OpenSpec, Spec Kit, or a direct implementation flow.

## Why Aircury

Most AI coding setups are either too loose or too heavy. A plain agent can move fast, but it usually forgets project rules, skips documentation, and leaves no durable behavior record. A formal workflow can improve discipline, but it can also make small changes unnecessarily slow.

Aircury sits between those extremes. It gives agents a routing layer that chooses the right level of structure for the task:

- Use `plan-build` for clear day-to-day changes.
- Use OpenSpec when a change needs proposal, implementation, and completion artifacts.
- Use Spec Kit when requirements need formal clarification and planning before code.
- Always converge on `specs/features/` so behavior knowledge survives beyond the current chat.

## What This Framework Adds

Aircury is not just a collection of prompts. It installs a project operating system for AI-assisted delivery:

- **One source of truth**: observable behavior is captured in `specs/features/`, independent of the workflow that produced it.
- **Workflow routing**: agents recommend the lightest safe mode instead of forcing every task through the same process.
- **Project-scoped rules**: generated `FRAMEWORK.md` and `AGENTS.md` make standards explicit for every future AI session.
- **Composable standards**: teams can enable ADRs, DDD, hexagonal architecture, testing, frontend, logging, error handling, memory, and token-efficiency modules.
- **Skill wiring**: curated skill groups are installed through `npx skills add`, so workflows are executable rather than only documented.
- **Reduced intention debt**: ADRs, specs, and optional Airsync memory preserve why decisions were made, not just what code changed.

The result is a setup where agents know how to work, what to protect, when to ask for structure, and where to leave durable project knowledge.

## Documentation

| Document | Purpose |
|---|---|
| [`docs/implementation.md`](docs/implementation.md) | How the installer works, what it writes, and how to implement the framework in a project. |
| [`docs/playbook.md`](docs/playbook.md) | Practical examples for choosing workflow modes and using the installed skills. |
| [`docs/contribution.md`](docs/contribution.md) | How to contribute modules, templates, skills, and the download/install wiring. |

## Quick Install

Run the installer from the target project directory:

```bash
bunx @aircury/ai-framework
# or
npx @aircury/ai-framework
```

The TUI asks for:

1. Scope: local project setup or global machine setup.
2. AI tools: `AGENTS.md` support plus optional `CLAUDE.md` or `GEMINI.md` files.
3. Standards modules: optional project rules such as ADRs, DDD, testing, frontend, and token efficiency.
4. Skill groups: bundled workflows installed through `npx skills add`.

## What It Installs

| Scope | Outputs |
|---|---|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, starter `specs/` folders, optional tool files, selected skills, and a `.gitignore` entry for `specs/changes/`. |
| Global | Selected skills for the chosen global agent integrations. |

## Core Concepts

- `FRAMEWORK.md` is the project constitution generated from selected modules.
- `AGENTS.md` is the short agent entrypoint and points agents to `FRAMEWORK.md`.
- `.aircury/framework.config.json` records the selected local standards profile.
- `specs/features/` stores versioned, canonical behavior specs.
- `specs/changes/` stores temporary workflow artifacts and is ignored by git.
- Skill groups expand into concrete `npx skills add <source> --skill <name>` commands.

## Supported Workflow Modes

| Mode | Use when |
|---|---|
| `plan-build` | The change is clear and does not need formal workflow artifacts. |
| `propose-apply-complete` | The change is complex or cross-cutting but understood. |
| `explore-propose-apply-complete` | The root cause or scope is unclear and needs investigation first. |
| `spec-kit` | A feature needs formal requirements, clarification, planning, and delivery governance. |

See [`docs/playbook.md`](docs/playbook.md) for concrete prompts and examples.

Use [`docs/contribution.md`](docs/contribution.md) before adding modules, skills, or installer wiring.
