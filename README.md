# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-routing framework for AI-assisted software engineering. Its main job is to decide which workflow an AI agent should use for each request.

You normally do not choose a mode. Ask for the work you need, and the framework tells the agent whether to use `plan-build`, OpenSpec, Spec Kit, or a direct implementation flow. Only specify a mode when you explicitly want to force that workflow.

It also installs project rules, agent entrypoints, living specification folders, optional engineering standards, and curated skills while separating a shared workflow constitution from installable capabilities.

## Why Aircury

Aircury gives agents enough structure to work consistently without forcing every change through a heavy process. The default behavior is automatic routing:

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

If files already exist, the installer asks whether to skip or overwrite them. Skills are installed through the skills ecosystem with `npx` or `bunx`, so they can be updated later.

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
