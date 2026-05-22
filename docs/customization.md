# Customization Guide

This guide explains how to customise an installed Aircury AI Framework project without losing local changes when the framework is reinstalled or updated.

## Mental Model

Aircury separates generated framework content from project-owned customisation.

Generated framework files can be replaced by future installs. Project-owned customisation lives under `.localRules/` and should be committed with the repository.

Use these paths:

| Path | Purpose |
|---|---|
| `.localRules/framework.local.md` | Project-specific framework rules and notes. |
| `.agents/skills/<skill-name>/` | Runtime skill directory used by universal agents. |
| `.claude/skills/<skill-name>/` | Runtime skill directory used by Claude Code. |
| `.localRules/skills/<skill-name>/` | Versioned project copy of a modified or local skill. |
| `.aircury/framework.config.json` | Installed capability profile and local skill registration. |

Do not edit generated framework files such as `FRAMEWORK.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `docs/aircury/capabilities/*.md` for project-specific rules. Put those changes in `.localRules/framework.local.md`.

## Customise Framework Rules

Use `.localRules/framework.local.md` for repository-specific instructions, architecture notes, verification commands, and agent guidance.

The installer creates this file on the first local install and does not overwrite it on later installs.

Recommended sections:

```md
## Project Rules

## Verification

## Architecture Notes

## Agent Instructions
```

Commit `.localRules/framework.local.md` with the project so future agents and teammates get the same local rules.

## Modify An Official Skill

Official skills are installed into runtime directories. Edit the runtime copy first so you can use and validate the changed skill immediately.

Preferred edit location:

1. `.agents/skills/<skill-name>/` when it exists.
2. `.claude/skills/<skill-name>/` only when Claude Code is the only active runtime copy.

After editing, copy the full runtime skill directory into `.localRules/skills/<skill-name>/`.

The copy must include `SKILL.md` and any bundled `references/`, `scripts/`, or `assets/` directories.

Do not change `metadata.version` when modifying an existing official skill. That version identifies the official base version your local changes were based on.

Example result:

```text
.agents/skills/frontend-ui-workflow/SKILL.md
.localRules/skills/frontend-ui-workflow/SKILL.md
```

When the framework is installed again, Aircury installs the official skill first, then compares versions:

| Version Comparison | Installer Behaviour |
|---|---|
| Official version equals local shadow version | Restores `.localRules/skills/<skill-name>/` into `.agents/skills/<skill-name>/`. |
| Official version differs from local shadow version | Keeps the official runtime skill and prints a warning. |
| Either version is missing or unparsable | Keeps the official runtime skill and prints a warning. |

When Claude Code is selected, the final `.agents/skills/<skill-name>/` content is then synced into `.claude/skills/<skill-name>/`.

## Create A New Local Skill

Use a new local skill when the workflow is specific to your repository and is not an override of an official skill.

Create the skill in the runtime location first, usually:

```text
.agents/skills/<skill-name>/SKILL.md
```

Use `.claude/skills/<skill-name>/SKILL.md` only when Claude Code is the only runtime you use.

The folder name, frontmatter `name`, and config `localSkills[].name` must match exactly.

The file must be named `SKILL.md` with uppercase `SKILL`. A lowercase `skill.md` is ignored.

Starter skill:

```md
---
name: project-release-checks
description: Use this skill when preparing a release for this repository.
license: MIT
metadata:
  author: Local project
  version: "1.0"
---

# Project Release Checks

Follow this repository's release checklist.
```

After creating and validating the runtime skill, copy the full skill directory into `.localRules/skills/<skill-name>/`:

```text
.agents/skills/project-release-checks/
-> .localRules/skills/project-release-checks/
```

Then register it in `.aircury/framework.config.json` under `localSkills`:

```json
{
  "localSkills": [
    {
      "name": "project-release-checks",
      "kind": "local-skill",
      "source": ".localRules/skills/project-release-checks"
    }
  ]
}
```

The `localSkills` entry does not include a runtime path or version. Runtime sync is handled by the installer, and the skill version lives in `SKILL.md` as `metadata.version`.

On future local installs, registered local skills are restored into `.agents/skills/<skill-name>/`. If Claude Code is selected, they are also synced into `.claude/skills/<skill-name>/`.

## What Gets Restored Automatically

The installer restores two kinds of saved local skill content.

Official skill shadows:

- The skill must be selected by an installed capability.
- `.localRules/skills/<skill-name>/SKILL.md` must exist.
- `metadata.version` must match the newly installed official runtime skill version.

New local skills:

- The skill must be listed in `.aircury/framework.config.json` under `localSkills`.
- `localSkills[].source` must point to a directory containing `SKILL.md`.

Folders in `.localRules/skills/` that are neither compatible official shadows nor registered local skills are left untouched but are not installed automatically.

## Update And Migration Workflow

When updating the framework, run the installer again from the project root.

If the installer restores a local skill shadow, no manual action is needed.

If the installer warns that a local skill shadow was kept for manual migration:

1. Compare the official runtime skill in `.agents/skills/<skill-name>/` with the saved local shadow in `.localRules/skills/<skill-name>/`.
2. Decide which local changes still apply to the new official version.
3. Edit the runtime skill deliberately.
4. Copy the updated runtime skill back into `.localRules/skills/<skill-name>/`.
5. Keep the official `metadata.version` value unless you are creating a brand-new local-only skill.

Do not rely on automatic text merges for skill migrations. Skill wording changes agent behaviour and should be reviewed intentionally.

## Safety Checklist

Before finishing a customisation change, confirm:

- Project rules are in `.localRules/framework.local.md`, not generated framework files.
- Modified official skills were edited in runtime first and copied to `.localRules/skills/<skill-name>/`.
- New local skills are registered in `.aircury/framework.config.json` under `localSkills`.
- Every skill directory contains `SKILL.md` with uppercase `SKILL`.
- Skill folder name, frontmatter `name`, and `localSkills[].name` match.
- Existing official skill customisations did not change `metadata.version`.
- `.localRules/` is committed with the repository.
