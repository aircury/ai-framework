---
name: local-customization
description: Use this skill whenever the user wants to customise the Aircury framework locally, edit .localRules/framework.local.md, create a new runtime skill, or modify an installed/official runtime skill while preserving local changes across framework updates. This skill edits runtime skills in .agents/skills/ or .claude/skills/, then persists a copy into .localRules/skills/ without changing the skill version.
license: MIT
metadata:
  author: Aircury
  version: "1.0"
---

# Local Customization Workflow

Use this workflow when the user wants repository-specific framework rules or skill customisations.

The goal is to preserve user changes across installer updates without hiding the official framework update path.

## Local Customisation Paths

- Framework rules: `.localRules/framework.local.md`
- Persisted local skill shadows: `.localRules/skills/<skill-name>/`
- Runtime installed skills: `.agents/skills/<skill-name>/`
- Claude Code runtime skills: `.claude/skills/<skill-name>/`

Treat `.localRules/framework.local.md` as the source of truth for framework rules.

Treat `.agents/skills/` and `.claude/skills/` as the primary editing locations for skills. After changing a runtime skill, persist the changed runtime directory into `.localRules/skills/<skill-name>/` so the project keeps a versioned copy.

Do not edit generated framework files such as `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, or `docs/aircury/capabilities/*.md` unless the user explicitly asks to change framework source code.

## Workflow Router

Choose the smallest safe path.

### Edit Local Framework Rules

Use this path when the user asks to add repository-specific instructions, project rules, architecture notes, verification commands, or agent guidance.

1. Read `FRAMEWORK.md` and existing `.localRules/framework.local.md` when present.
2. Create `.localRules/framework.local.md` if it does not exist.
3. Add or update only the relevant local section.
4. Preserve unrelated local content.
5. Keep rules concise, actionable, and specific to this repository.

Prefer sections such as:

```md
## Project Rules

## Verification

## Architecture Notes

## Agent Instructions
```

### Modify An Existing Skill

Use this path when the user wants to adapt an installed, official, or external skill for this repository.

1. Identify the skill name and source location.
2. Prefer this runtime edit source order:
   - `.agents/skills/<skill-name>/` when installed locally.
   - `.claude/skills/<skill-name>/` when only Claude Code has it locally.
3. If no runtime copy exists but this is the framework repository, use `skills/<skill-name>/` only as a source to install or copy into a runtime skill directory first.
4. Edit the runtime skill directory, including `SKILL.md` and any bundled local resources there.
5. Keep the skill `name` unchanged when overriding an existing skill.
6. Do not change `metadata.version` when modifying an existing skill. The version identifies the official base version used for update comparison; changing it would hide whether the framework has shipped a newer version.
7. If the existing skill has no `metadata.version`, do not add or invent one while modifying it. Report that the upstream version was unknown.
8. After editing and checking the runtime skill, copy the full runtime skill directory into `.localRules/skills/<skill-name>/`.
9. Summarise both paths: the runtime skill edited and the persisted shadow copy.

### Create A New Local Skill

Use this path when the user wants a new repository-specific skill.

1. Derive a kebab-case skill name.
2. Create the new skill first in the runtime location that the selected agent uses, usually `.agents/skills/<skill-name>/SKILL.md`.
3. If the user is working primarily with Claude Code and `.claude/skills/` is the only active runtime, create it in `.claude/skills/<skill-name>/SKILL.md`.
4. Write frontmatter with `name`, `description`, `license`, and `metadata.version`.
5. For a brand-new local skill, set `metadata.version` to `"1.0"`.
6. Make the description explicit about when the skill should trigger.
7. Keep the body focused on deterministic workflow steps and repository-specific context.
8. Add bundled `references/`, `scripts/`, or `assets/` only when the skill needs them.
9. Copy the completed runtime skill directory into `.localRules/skills/<skill-name>/`.
10. Add or update the new skill in `.aircury/framework.config.json` under `localSkills` so the installer can restore it on future installs.
11. Tell the user that the runtime skill was created, that `.localRules/skills/` holds the persisted project copy, and that `.aircury/framework.config.json` tracks it.

Starter frontmatter:

```md
---
name: example-local-skill
description: Use this skill when ...
license: MIT
metadata:
  author: Local project
  version: "1.0"
---
```

Config entry for a new local skill:

```json
{
  "localSkills": [
    {
      "name": "example-local-skill",
      "kind": "local-skill",
      "source": ".localRules/skills/example-local-skill"
    }
  ]
}
```

When updating `.aircury/framework.config.json`, preserve existing capabilities, language preferences, notices, and unrelated `localSkills` entries. Replace only the entry with the same `name`.

## Safety Rules

- Never overwrite `.localRules/skills/<skill-name>/` without reading it first.
- Never discard user-authored local rules or local skill content.
- Never leave a modified runtime skill unpersisted; copy it to `.localRules/skills/<skill-name>/` before finishing.
- Never leave a new local skill unregistered; add it to `.aircury/framework.config.json` under `localSkills` before finishing.
- Never change `metadata.version` when modifying an existing skill. Only new local skills get a new local version.
- Do not perform automatic merges between upstream and local skill text; skill wording changes agent behaviour and should be reviewed deliberately.
- If upstream and persisted local versions differ during an update, keep the official runtime skill installed and tell the user manual migration may be needed.
- Keep generated Aircury files untouched during local customisation work.

## Completion Summary

When finished, report:

- Files created or changed under `.localRules/`.
- Runtime skill files created or changed under `.agents/skills/` or `.claude/skills/`.
- Whether the runtime skill was persisted into `.localRules/skills/`.
- Whether a new local skill was registered in `.aircury/framework.config.json` under `localSkills`.
- The `metadata.version` found, and confirmation that it was not changed for existing skills.
- Whether the installer must be rerun to sync runtime skill directories.
