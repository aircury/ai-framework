# Local Rules And Runtime Skill Customisation Slices

## Goal

Aircury must support project-level customisation without making framework updates unsafe.

The desired model has two different customisation flows:

- Framework rules are edited directly in `.localRules/framework.local.md`.
- Skills are edited in their real runtime locations, then copied into `.localRules/skills/<skill-name>/` as the versioned local shadow copy.

`.localRules/` is committed with the project. It is the durable local layer that survives framework reinstalls and updates.

Runtime skill directories remain the places where agents actually load and execute skills:

- `.agents/skills/<skill-name>/`
- `.claude/skills/<skill-name>/`

When the framework is updated, the installer installs the official framework skill version first. If a saved local shadow exists, the installer compares versions. Matching versions can be restored automatically from `.localRules/skills/<skill-name>/`; changed official versions stay installed and produce a warning so the user can manually migrate local changes.

## Target Behaviour

The complete system should support this loop:

1. A user asks to customise project framework rules.
2. The agent edits `.localRules/framework.local.md` directly.
3. A user asks to modify an installed skill.
4. The agent edits the real runtime skill in `.agents/skills/<skill-name>/` or `.claude/skills/<skill-name>/`.
5. After editing, the agent copies that modified runtime skill into `.localRules/skills/<skill-name>/`.
6. The project commits `.localRules/`.
7. On future framework updates, the installer installs the official skill, detects the saved local shadow copy, compares versions, restores the local copy only when versions match, and otherwise keeps the new official runtime skill installed while warning the user to migrate manually.

## Important Distinction

Do not treat `.localRules/skills/` as the primary editing location for skills.

The primary editing location for skills is the runtime skill directory because that is where the agent can immediately use and validate the change.

`.localRules/skills/` is the persistent versioned copy of the modified runtime skill.

## Slice 1: Local Rules Structure

Introduce the versioned local customisation folder for framework-level rules.

TODO:

- Replace `FRAMEWORK.local.md` with `.localRules/framework.local.md` in the installer.
- Create `.localRules/framework.local.md` on first local install.
- Protect `.localRules/framework.local.md` from overwrites on future installs.
- Ensure `.localRules/` is not added to `.gitignore`.
- Update generated starter content to state that `.localRules/` is intended to be versioned.
- Update generated framework and agent instructions to read `.localRules/framework.local.md`.
- Update tests that currently expect `FRAMEWORK.local.md`.

## Slice 2: Official Skill Versions

Make skill update detection possible through explicit official skill versions.

TODO:

- Add a helper that reads `metadata.version` from a skill `SKILL.md` frontmatter block.
- Add a small SemVer-like comparator for numeric versions such as `1.2.0`.
- Treat missing or unparsable versions as `unknown`.
- Ensure every official Aircury skill in `skills/` has `metadata.version`.
- Add tests for equal, greater, lower, and unknown versions.
- Document that official Aircury skills must include `metadata.version`.
- Document that official behaviour changes must bump the skill version.

## Slice 3: Saved Local Skill Shadow Detection

Detect saved local shadow copies that may affect the installer after official skill installation.

TODO:

- Add `.localRules/skills/<skill-name>/` as the saved shadow copy location.
- Consider a saved shadow valid only when `.localRules/skills/<skill-name>/SKILL.md` exists.
- Detect saved shadows only for selected capability skills.
- Return detected shadow metadata to the installer flow.
- Add tests for existing shadow, missing shadow, and folder without `SKILL.md`.

## Slice 4: Persist Runtime Skill Customisations

Add a way to copy a modified runtime skill into `.localRules/skills/`.

This is the direction used when the user modifies a skill:

```text
.agents/skills/<skill-name>/ or .claude/skills/<skill-name>/
-> .localRules/skills/<skill-name>/
```

TODO:

- Add a helper that persists a runtime skill directory into `.localRules/skills/<skill-name>/`.
- Prefer `.agents/skills/<skill-name>/` as the runtime source when both `.agents` and `.claude` exist.
- Fall back to `.claude/skills/<skill-name>/` when only Claude Code has the runtime skill.
- Require `SKILL.md` in the runtime source before persisting.
- Copy the full skill directory, including bundled `references/`, `scripts/`, and `assets/`.
- Never delete unrelated `.localRules/skills/` entries.
- Add tests proving a modified runtime skill is copied into `.localRules/skills/`.
- Add tests proving missing runtime skills are reported rather than silently creating invalid shadows.

## Slice 5: Conditionally Restore Saved Skill Shadows During Install

Restore saved local skill shadows only when they are compatible with the installed official skill version.

This is the restore direction when the saved local shadow is compatible:

```text
.localRules/skills/<skill-name>/
-> .agents/skills/<skill-name>/
-> .claude/skills/<skill-name>/ when Claude Code is selected
```

TODO:

- Run comparison after `skills add` succeeds.
- Compare the newly installed official runtime skill in `.agents/skills/<skill-name>/SKILL.md` with the saved local shadow in `.localRules/skills/<skill-name>/SKILL.md` before deciding whether to replace it.
- Copy `.localRules/skills/<skill-name>/` over `.agents/skills/<skill-name>/` only when versions match.
- Keep the newly installed official `.agents/skills/<skill-name>/` when the official version is greater or otherwise different.
- Never modify `.localRules/skills/<skill-name>/` during install comparison or restoration.
- Keep the current Aircury fallback for skills that were not materialised by `skills add`.
- Add tests proving the saved shadow replaces the installed `.agents/skills/` copy when versions match.
- Add tests proving the official installed skill remains active when versions differ.

## Slice 6: Update Warnings

Warn when a saved local skill shadow may need manual migration to the installed official skill.

TODO:

- Emit no warning when local shadow and official runtime versions match.
- Emit a warning when the official runtime version is greater than the saved local shadow version.
- Emit a warning when versions differ but ordering cannot be trusted.
- Emit a softer warning when either version is `unknown`.
- Do not block installation because of version differences.
- Keep the newly installed official runtime skill when a warning is emitted.
- Leave `.localRules/skills/<skill-name>/` intact so the user can manually migrate local changes.
- Add tests for matching versions, official greater version, mismatched versions, and unknown versions.

## Slice 7: Claude Code Sync

Ensure Claude Code receives the final runtime skill content after conditional restore decisions.

TODO:

- Make conditional restore decisions for `.agents/skills/` before syncing Claude Code skills.
- Copy the final `.agents/skills/<skill-name>/` content into `.claude/skills/<skill-name>/`.
- Preserve the existing same-path guard for symlinked directories.
- Keep missing-skill reporting for skills that cannot be found anywhere.
- Add a test proving a restored matching local shadow is copied to `.claude/skills/`.
- Add a test proving a newer official skill is copied to `.claude/skills/` when versions differ.

## Slice 8: Local Customisation Skill

Provide an agent workflow skill that tells agents how to customise the framework and runtime skills correctly.

This skill should teach the agent the correct direction of writes:

- Framework rules: edit `.localRules/framework.local.md` directly.
- Skill modifications: edit `.agents/skills/<skill-name>/` or `.claude/skills/<skill-name>/`, then persist the modified runtime skill to `.localRules/skills/<skill-name>/`.

TODO:

- Create an official Aircury skill for local customisation workflows.
- Include guidance for editing `.localRules/framework.local.md`.
- Include guidance for modifying an existing runtime skill and then saving a shadow copy.
- Include guidance for creating a new runtime skill and then saving it into `.localRules/skills/`.
- Warn agents not to edit generated framework files for local rules.
- Warn agents not to treat `.localRules/skills/` as the primary skill editing location.
- Wire the skill into a default capability so it is available in normal installs.
- Add tests proving the skill is included in install commands.

## Slice 9: TUI Reporting

Expose local customisation decisions without interrupting the install flow.

TODO:

- Report how many saved local skill shadows were restored because versions matched.
- Report how many saved local skill shadows were not restored because the official version changed.
- Report each version warning after the install spinner stops.
- Keep warnings non-fatal.
- Avoid adding an extra confirmation prompt.
- Keep existing install failure behaviour when `skills add` fails.
- Add tests for returned install result helpers where possible.

## Slice 10: Installer Tests

Cover the complete local customisation workflow at function level.

TODO:

- Test `.localRules/framework.local.md` generation and protection.
- Test saved local skill shadow detection in `.localRules/skills/`.
- Test persisting a modified runtime skill from `.agents/skills/` to `.localRules/skills/`.
- Test persisting a modified runtime skill from `.claude/skills/` when `.agents/skills/` is unavailable.
- Test saved local skill shadow restoration into `.agents/skills/` when versions match.
- Test official skill retention in `.agents/skills/` when versions differ.
- Test saved local skill shadow sync into `.claude/skills/` when versions match.
- Test official skill sync into `.claude/skills/` when versions differ.
- Test no warning for equal versions.
- Test warning for official version greater than saved local shadow version.
- Test warning for missing or unparsable versions.

## Slice 11: Documentation

Document the user-facing and contributor-facing workflow.

TODO:

- Update `docs/implementation.md` with `.localRules/framework.local.md`.
- Explain that `.localRules/` is versioned and should not be ignored.
- Explain that runtime skills are edited in `.agents/skills/` or `.claude/skills/`.
- Explain that modified runtime skills are copied into `.localRules/skills/` for persistence.
- Explain that installer updates restore saved shadows from `.localRules/skills/` into runtime skill directories only when versions match.
- Explain that official skill versions stay installed when versions differ.
- Explain manual migration when official skill versions advance.
- Update `docs/contribution.md` to require `metadata.version` in official skills.
- Update `docs/contribution.md` to require version bumps for official skill behaviour changes.
- Remove or correct obsolete references to `FRAMEWORK.local.md`.

## Slice 12: Verification

Validate the implementation before merging.

TODO:

- Run `bun test`.
- Run `bun run build`.
- Run `bun run lint` if formatting or lint-sensitive code changed.
- Test local install in a temporary repository.
- Confirm `.localRules/` is created and not ignored.
- Confirm framework rules are edited only in `.localRules/framework.local.md`.
- Confirm a modified runtime skill can be persisted into `.localRules/skills/`.
- Confirm a saved local skill shadow is restored into `.agents/skills/` after install when versions match.
- Confirm a changed official skill remains installed when versions differ.
- Confirm final runtime skill content is synced into `.claude/skills/` when Claude Code is selected.
- Confirm a version mismatch warning is visible and non-fatal.
