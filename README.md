# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects while separating a shared workflow constitution from installable capabilities.

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
- **Skill wiring**: selected capabilities install curated skills through `npx skills add`, so workflows are executable rather than only documented.
- **Reduced intention debt**: ADRs, specs, and optional Airsync memory preserve why decisions were made, not just what code changed.

The result is a setup where agents know how to work, what to protect, when to ask for structure, and where to leave durable project knowledge.

## Documentation

| Document | Purpose |
|---|---|
| [`docs/implementation.md`](docs/implementation.md) | How the installer works, what it writes, and how to implement the framework in a project. |
| [`docs/playbook.md`](docs/playbook.md) | Practical examples for choosing workflow modes and using the installed skills. |
| [`docs/contribution.md`](docs/contribution.md) | How to contribute modules, templates, skills, and the download/install wiring. |

## Quick Install

Run the installer from any project directory (or your home directory for a global setup):

```bash
bunx @aircury/ai-framework
# or
npx @aircury/ai-framework
```

The TUI asks for:

1. **Scope** — `Local` to configure the current project, `Global` to configure your machine.
2. **AI tools** — select the tool-specific integrations you want.
3. **Language preference** — for local installs, optionally enforce British English and include the language capability.
4. **Capabilities** — choose the workflows and standards this installation should include.

The installer writes all required configuration files, starter spec folders, and agent instructions to the right locations for each tool. Skills are installed through the standard `npx skills add ...` flow so they remain tracked by the skills ecosystem and can be updated later with `npx skills update`. Capability installation is driven by a single catalog in `src/capabilities.ts`, so project rules and installable skills are selected through the same flow. If files already exist you can choose to skip them or overwrite them.

## What It Installs

| Scope | Outputs |
|---|---|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, starter `specs/` folders, optional tool files, selected skills, and a `.gitignore` entry for `specs/changes/`. |
| Global | Selected skills for the chosen global agent integrations. |

## Core Concepts

### Capabilities

Local installs persist the selected capabilities in `.aircury/framework.config.json`.
Each capability can contribute machine-readable metadata, framework and agent content, starter files, and installable skills. The final `FRAMEWORK.md` and `AGENTS.md` files are rendered from dedicated templates.

Representative built-in capabilities:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `decision-records`
- `testing`
- `hexagonal-architecture`
- `ddd`
- `frontend`
- `token-efficiency`
- `resilience`

The installer and template generation are registry-driven, so adding a new capability only requires:

- defining it in `src/capabilities.ts`
- adding any content fragments and starter files it needs
- letting the renderer and installer compose it through the shared plan

---

## Capability Model

Each capability can do one or more of the following:

- add sections to `FRAMEWORK.md`
- add rules to `AGENTS.md`
- create starter files such as `specs/ui/README.md`
- install one or more skills through `npx skills add <source> --skill ...`

Examples:

- `frontend` adds frontend-specific rules, writes `specs/ui/README.md`, and installs `frontend-layout-extractor`, `frontend-experience-extractor`, and `frontend-ui-generator`.
- `token-efficiency` adds terse-response rules and installs `caveman`.
- `architecture` installs `clean-ddd-hexagonal` from `https://github.com/ccheney/robust-skills`.
- `specs` installs `specs-extractor` and `specs-interpreter` from `aircury/ai-framework`.
- `open-spec` and `spec-kit` are workflow capabilities that mainly install skills rather than change project files directly.

All skills write ephemeral working artifacts to `specs/changes/<name>/` and sync canonical output to `specs/features/` on completion.

The default local and global capability selections include `specs`, so fresh installs also add `specs-extractor` and `specs-interpreter` unless the user explicitly deselects that capability.

Curated external skills can be added to the capability catalog and will appear in the same multiselect flow alongside built-in Aircury capabilities.

When the local `token-efficiency` capability is enabled, the installer also adds project rules that start each new session in `caveman full` while keeping responses terse by default. This is intentionally project-scoped: it uses generated agent instruction files plus the `caveman` skill, and does not install any global shell hooks.

---

## Supported workflow modes

| Mode | When to use | Skills |
|------|-------------|--------|
| `plan-build` | Easy to medium changes — the default for most tasks | None |
| `propose-apply-complete` | Complex or cross-cutting change | `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `explore-propose-apply-complete` | Unclear problem requiring investigation first | `open-spec-explore`, then `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `spec-kit` | New feature, formal requirements, or spec governance needed | `spec-kit-specify`, `spec-kit-clarify`, `spec-kit-plan`, `spec-kit-analyse`, `spec-kit-tasks`, `spec-kit-implement`, `spec-kit-checklist` |

For most day-to-day work, `plan-build` is sufficient. Reach for `open-spec` or `spec-kit` when the problem size or ambiguity warrants the extra structure.

The agent recommends a mode and asks before starting. The user always decides.

See [`docs/playbook.md`](docs/playbook.md) for concrete prompts and examples.

Use [`docs/contribution.md`](docs/contribution.md) before adding modules, skills, or installer wiring.
