---
name: sdd-complete
description: Mark a change as complete. Syncs specs/features/ to reflect current system behavior, then cleans up optional workflow artifacts. Framework-agnostic and independent of any external spec tool.
license: MIT
compatibility: No external tools required.
metadata:
  author: Aircury
  version: "1.0"
---

Mark a change as done and sync the living specs.

**Framework-agnostic**: works whether you used temporary change artifacts, plan mode, TDD, or direct implementation.
The only obligation: `specs/features/` must reflect what the system does now.

---

**Input**: Optionally specify a change name (if using `specs/changes/<name>/`). Otherwise the diff is inferred from git automatically.

**Steps**

1. **Understand what changed**

   ```bash
   git diff HEAD --stat
   git status
   ```

   Read the key changed files to understand which behaviors were added, modified, or removed.

2. **Check for workflow artifacts**

   Check if `specs/changes/<name>/` exists:
   - **Yes** (structured workflow): Use the working artifacts there as planning context while updating canonical specs.
   - **No** (plan mode / TDD / direct): Read the changed code and identify which requirements in `specs/features/` are affected by the diff.

3. **Update specs/features/**

   For each affected capability:
   - Read `specs/features/<capability>/spec.md`
   - Identify what to add, modify, or remove based on the actual behavioral change
   - Apply the minimum necessary update using RFC 2119 + WHEN/THEN format
   - If behavior belongs to a new capability, create `specs/features/<new-capability>/spec.md`

   **Format** (from AGENTS.md):
   ```
   ### Requirement: <system behavior as a declarative statement>
   <One-sentence description using SHALL/MUST.>

   #### Scenario: <observable outcome>
   - **WHEN** <condition or trigger>
   - **THEN** <expected system response>
   ```

   Specs describe behavior, not implementation. No technology names, no framework references.

4. **Clean up ephemeral artifacts**

   If `specs/changes/<name>/` exists:
   ```bash
   rm -rf specs/changes/<name>
   ```

   Workflow scaffolding is never committed — it served its purpose.

5. **Report**

   Show what changed in `specs/features/`. The user should commit these alongside the code changes.

**Output**

```
## Specs Updated

### Modified
- specs/features/learning-content-admin/spec.md — Added scenario: [...]
- specs/features/detectives-scenario-admin/spec.md — Updated requirement: [...]

### Created
- specs/features/<new-capability>/spec.md — New capability

### Cleaned up
- specs/changes/<name>/ (ephemeral artifacts removed)

Commit specs/features/ with the rest of this change.
```

**Guardrails**
- Always update `specs/features/` — if observable behavior changed, the spec must change
- Never archive artifacts — delete them (they are gitignored and ephemeral)
- Specs describe behavior only: no DB schemas, no component names, no endpoint paths
- If the change was a pure internal refactor with no observable behavior change, confirm with user before skipping
- One `spec.md` per capability, not per task or PR
- Spec updates must pass the rebuild test: could a developer reconstruct this feature from the spec alone?
