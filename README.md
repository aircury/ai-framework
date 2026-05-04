# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects while separating a shared workflow constitution from installable capabilities.

It installs project rules, agent entrypoints, living specification folders, optional engineering standards, and curated skills. The canonical source of truth for behavior is always `specs/features/`, whether a task uses `plan-build`, OpenSpec, Spec Kit, or a direct implementation flow.

## Why Aircury

Aircury gives agents enough structure to work consistently without forcing every change through a heavy process:

- Use `plan-build` for clear day-to-day changes.
- Use OpenSpec when a change needs proposal, implementation, and completion artifacts.
- Use Spec Kit when requirements need formal clarification and planning before code.
- Keep durable behavior knowledge in `specs/features/`.

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

If files already exist, the installer asks whether to skip or overwrite them. Skills are installed through `npx skills add ...` so they can be updated later with the skills ecosystem.

## What It Installs

| Scope | Outputs |
|---|---|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, starter `specs/` folders, optional tool files, selected skills, and a `.gitignore` entry for `specs/changes/`. |
| Global | Selected skills for the chosen global agent integrations. |

## Documentation

| Document | Purpose |
|---|---|
| [`docs/concepts.md`](docs/concepts.md) | Conceptual model: why the framework exists, workflow routing, capabilities, and canonical specs. |
| [`docs/implementation.md`](docs/implementation.md) | Installer flow, generated files, capabilities, skill installation, and conflict handling. |
| [`docs/playbook.md`](docs/playbook.md) | Workflow selection guide, examples, and operating rules for installed projects. |
| [`docs/contribution.md`](docs/contribution.md) | How to contribute modules, templates, skills, and installer wiring. |
