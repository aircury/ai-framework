# Contribution Guide

This guide explains how to contribute to Aircury AI Framework and how to wire new installable content so users can download it through the installer.

The package entrypoint is `src/cli.ts`. The published binary is `ai-framework`, built to `dist/cli.js`.

## Test Local Installer Changes

Before publishing or opening a PR, test the installer from your local checkout.

From this repository, build the CLI:

```bash
bun run build
```

Then run the built installer from a separate throwaway project directory:

```bash
node /absolute/path/to/ai-framework/dist/cli.js
```

Example:

```bash
mkdir /tmp/aircury-install-test
cd /tmp/aircury-install-test
git init
node /home/alex/projects/ai-framework/dist/cli.js
```

Use a throwaway directory because local installation writes framework files such as `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, starter `specs/` folders, `.gitignore`, and selected tool-specific files.

If you only changed templates, modules, generated files, or skill wiring, this local installer run is the fastest way to confirm the TUI, rendered output, conflict handling, and generated `npx skills add` commands still match expectations.

## Project Structure

| Path | Purpose |
|---|---|
| `src/tui.ts` | Interactive installer flow. |
| `src/install.ts` | File generation, conflict handling, skill command construction, and `.gitignore` update. |
| `src/capabilities.ts` | Capability registry, generated content wiring, skill definitions, default selections, and profile creation. |
| `src/renderer.ts` | Template rendering and computed template flags. |
| `templates/` | Handlebars templates for generated `FRAMEWORK.md` and `AGENTS.md`. |
| `standards/modules/` | Installable standards modules. |
| `skills/` | Aircury skills that can be installed through `npx skills add aircury/ai-framework`. |
| `specs/` | Product specs and ADRs for this repository. |

## Add A Standards Module

Create a new folder under `standards/modules/<module-id>/` with:

- `module.json`
- `framework.md`
- `agents.md`

Example `module.json`:

```json
{
  "id": "example-module",
  "label": "Example Module",
  "hint": "short TUI hint",
  "description": "One sentence describing what this module enforces.",
  "defaultEnabled": false
}
```

Then wire it into `src/capabilities.ts`:

1. Import the three module files.
2. Add the id to `StandardModuleId`.
3. Add the module to `STANDARD_MODULES`.
4. Add the module id to the owning capability's `modules` list.
5. Add template flags only if the templates need conditional behavior beyond normal section rendering.

If the module needs starter files, attach them to the standard module. The owning capability will contribute those files when selected.

## Add Or Change Generated Files

Generated local files come from `getLocalFiles()` in `src/install.ts`. Base files are defined there, and capability-specific files are contributed by the selected capability manifests in `src/capabilities.ts`.

When adding a generated file:

1. Add an `InstallFile` entry with `path`, `content`, and `description`.
2. Decide whether it applies to every local install, selected tools, or selected capabilities.
3. Ensure conflict behavior is safe when the file already exists.
4. Add template flags only if the templates need conditional behavior beyond normal section rendering.
5. Update `docs/implementation.md` if users need to know about the output.

Avoid overwriting user-authored files unless the installer has asked for confirmation.

## Add A Skill

Skills are installed through the external `skills` CLI. Aircury only defines capability manifests and desired install commands.

To add an Aircury skill from this repo:

1. Add the skill folder under `skills/<skill-name>/` with its `SKILL.md`.
2. Add a skill entry to the relevant capability in `src/capabilities.ts`.
3. Use `source: "aircury/ai-framework"`.
4. Set the supported `scopes`.
5. Add or update tests if capability behavior changes.

To add an external skill:

1. Add a skill entry with the external repository URL in `source`.
2. Set the upstream skill name in `skillName`.
3. Set the supported `scopes`.

## Wire Download And Installation

The installer downloads skills by running generated `npx skills add` commands. The wiring lives in `src/capabilities.ts` and `src/install.ts`.

Add or update a `CapabilityManifest` when users should be able to select a capability in the TUI:

```ts
{
  id: "example",
  label: "Example",
  description: "Short description shown in the installer",
  category: "workflow",
  defaultSelected: false,
  scopes: ["local", "global"],
}
```

Add concrete skills through the capability's `skills` array:

```ts
{
  source: "aircury/ai-framework",
  skillName: "example-skill",
  scopes: ["local", "global"],
}
```

The install command is built automatically:

```bash
npx -y skills add aircury/ai-framework --skill example-skill -a universal -y
```

If multiple selected skills share a source, the installer groups them into one command with repeated `--skill` flags.

For global installs, the generated command includes `-g` and targets only selected global agents.

## Auto-Select Capabilities

Use `getInitialCapabilityIds()` or `resolveCapabilityIds()` in `src/capabilities.ts` when a capability should be preselected or implied because of another installer choice.

Current example:

- British English enables `language`.

## Update Templates

Generated documents are rendered from:

- `templates/framework.md.hbs`
- `templates/agents.md.hbs`

Use module fragments for module-specific rules. Change templates only for cross-cutting structure or conditional sections that cannot live inside one module.

## Release Checklist

Before publishing or opening a release PR:

1. Run `bun run build`.
2. Run `bun test`.
3. Run `bun run lint`.
4. Confirm generated docs still match the installer behavior.
5. Confirm new skills can be resolved by `npx skills add <source> --skill <skill-name>`.

Publishing is handled by the repository release workflow and the npm package metadata in `package.json`.
