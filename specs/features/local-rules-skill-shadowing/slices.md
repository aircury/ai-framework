# Local Rules And Skill Shadowing Slices

## Goal

Add versioned project-local customisation through `.localRules/`.

The folder is committed with the project and lets teams keep local framework rules and modified skill copies without losing upstream framework updates.

## Slice 1: Local Rules Structure

Introduce the versioned local customisation folder.

TODO:

- Replace `FRAMEWORK.local.md` with `.localRules/framework.local.md` in the installer.
- Create `.localRules/framework.local.md` on first local install.
- Protect `.localRules/framework.local.md` from overwrites on future installs.
- Ensure `.localRules/` is not added to `.gitignore`.
- Update generated starter content to state that `.localRules/` is intended to be versioned.
- Update tests that currently expect `FRAMEWORK.local.md`.

## Slice 2: Official Skill Versions

Make skill update detection possible through explicit skill versions.

TODO:

- Add a helper that reads `metadata.version` from a skill `SKILL.md` frontmatter block.
- Add a small SemVer-like comparator for numeric versions such as `1.2.0`.
- Treat missing or unparsable versions as `unknown`.
- Add tests for equal, greater, lower, and unknown versions.
- Document that official Aircury skills must include `metadata.version`.
- Document that official behaviour changes must bump the skill version.

## Slice 3: Local Skill Override Detection

Detect project-local skill copies that should shadow installed skills.

TODO:

- Add `.localRules/skills/<skill-name>/` as the override location.
- Consider an override valid only when `.localRules/skills/<skill-name>/SKILL.md` exists.
- Detect overrides only for selected capability skills.
- Return detected override metadata to the installer flow.
- Add tests for existing override, missing override, and folder without `SKILL.md`.

## Slice 4: Local Skill Shadowing

Apply local skill copies after official skill installation.

TODO:

- Run shadowing after `skills add` succeeds.
- Compare the installed official skill in `.agents/skills/<skill-name>/SKILL.md` with the local override.
- Copy `.localRules/skills/<skill-name>/` over `.agents/skills/<skill-name>/` when an override exists.
- Never modify `.localRules/skills/<skill-name>/` during installation.
- Keep the current Aircury fallback for skills that were not materialised by `skills add`.
- Add tests proving the local copy replaces the installed `.agents/skills/` copy.

## Slice 5: Update Warnings

Warn when a local override may be behind the official skill.

TODO:

- Emit no warning when local and official versions match.
- Emit a warning when the official version is greater than the local version.
- Emit a warning when versions differ but ordering cannot be trusted.
- Emit a softer warning when either version is `unknown`.
- Do not block installation because of version differences.
- Keep applying the local override even when a warning is emitted.
- Add tests for matching versions, official greater version, mismatched versions, and unknown versions.

## Slice 6: Claude Code Sync

Ensure Claude Code receives the final shadowed skill content.

TODO:

- Apply local skill shadowing before syncing Claude Code skills.
- Copy the final `.agents/skills/<skill-name>/` content into `.claude/skills/<skill-name>/`.
- Preserve the existing same-path guard for symlinked directories.
- Keep missing-skill reporting for skills that cannot be found anywhere.
- Add a test proving a local override is copied to `.claude/skills/`.

## Slice 7: TUI Reporting

Expose local shadowing results without interrupting the install flow.

TODO:

- Report how many local skill overrides were applied.
- Report each version warning after the install spinner stops.
- Keep warnings non-fatal.
- Avoid adding an extra confirmation prompt.
- Keep existing install failure behaviour when `skills add` fails.
- Add tests for returned install result helpers where possible.

## Slice 8: Installer Tests

Cover the new local customisation workflow end to end at function level.

TODO:

- Update `getLocalFiles()` tests for `.localRules/framework.local.md`.
- Update `isProtectedLocalCompanion()` tests for `.localRules/framework.local.md`.
- Update `writeFile()` preservation tests for `.localRules/framework.local.md`.
- Test local skill override replacement in `.agents/skills/`.
- Test local skill override sync into `.claude/skills/`.
- Test no warning for equal versions.
- Test warning for official version greater than local version.
- Test warning for missing or unparsable versions.

## Slice 9: Documentation

Document the user-facing and contributor-facing workflow.

TODO:

- Update `docs/implementation.md` with `.localRules/framework.local.md`.
- Update `docs/implementation.md` with `.localRules/skills/<skill-name>/` shadowing.
- Explain that `.localRules/` is versioned and should not be ignored.
- Explain manual migration when official skill versions advance.
- Update `docs/contribution.md` to require `metadata.version` in official skills.
- Update `docs/contribution.md` to require version bumps for official skill behaviour changes.
- Remove or correct obsolete references to `FRAMEWORK.local.md`.

## Slice 10: Verification

Validate the implementation before merging.

TODO:

- Run `bun test`.
- Run `bun run build`.
- Run `bun run lint` if formatting or lint-sensitive code changed.
- Test local install in a temporary repository.
- Confirm `.localRules/` is created and not ignored.
- Confirm a local skill override shadows the official installed skill.
- Confirm a version mismatch warning is visible and non-fatal.
