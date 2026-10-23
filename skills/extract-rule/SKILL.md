---
name: extract-rule
description: Distil reusable engineering rules from code changes and record them in docs/rules/. Use whenever the user wants to extract rules, conventions, or lessons from a diff, a commit, or the current uncommitted changes — e.g. "extract the rule from these changes", "what convention does this commit establish", "record this as a rule", or after a correction during review that should become a durable guideline for future work.
license: MIT
metadata:
  author: "@alejandrohernandez-aircury"
  version: "1.0"
---

Code changes often encode a decision that was made once but should guide every future change:
where a file belongs, how a test is written, what a layer may depend on.
This skill turns those implicit decisions into explicit rules under `docs/rules/`,
so agents and humans can follow them without rediscovering the reasoning.

The flow is interactive by design: the user confirms the distilled rules and their wording
before anything is written. Do not skip the confirmation points.

## Step 1: Establish the scope

Run `git status --porcelain`.

- If there are uncommitted changes (staged, unstaged, or untracked), those files are the scope.
- Otherwise, ask the user for a specific commit or a number of commits behind the current branch.
  Propose the latest commit (`HEAD`) as the default.

Set aside files that carry no engineering decision — agent/tooling artefacts
(e.g. `.agents/`, `skills-lock.json`), lockfiles, generated files — and say which ones you excluded.
State the chosen scope back to the user in one line before continuing.

## Step 2: Read the changes

Read the diffs for the scope (`git diff`, `git diff --cached`, or `git show`/`git diff HEAD~N` as appropriate),
plus enough of the surrounding files to understand the change in context.
The goal is to understand *why* the change was made, not just what moved —
commit messages, deleted files, renames, and related docs are all evidence.

## Step 3: Distil the rule

Extract the rule or rules that explain the changes.
A rule is the general principle you would tell an agent so it makes the same choice next time,
not a description of this particular diff.

Each rule must belong to one subcategory from this tree:

- Infrastructure
  - Deployment
  - CI
- Scaffolding
  - Docker
  - Folders
- Application
  - Framework
  - Security
- Domain
  - Common
- Test
  - E2E
  - Unit
  - Performance
  - Integration
- Database
  - Persistence
- Documentation
  - Markdown

The categories are fixed — never invent a new top-level category.
Subcategories are open: add a new one when the rule clearly deserves it
(e.g. `Test / Contract`, `Application / Validation`), and say so explicitly when you do.

If a rule could plausibly belong to more than one subcategory,
summarise the rule and ask the user which subcategory it belongs to.

When the changes yield rules across several subcategories, work one subcategory at a time:
pick one, set the other rules aside (keep an explicit list of them),
and after finishing Step 7 for the current subcategory, restart from Step 3 with the next set-aside rule.

For each rule in the current subcategory, expose the reasoning:
what in the diff suggests the rule, and why it matters beyond this change.
Then wait for the user to confirm the rule (or correct it) before moving on.

## Step 4: Contrast with existing rules

Rules live in `docs/rules/<category>/<subcategory>.md`
(lowercase kebab-case, e.g. `docs/rules/test/e2e.md`, `docs/rules/scaffolding/folders.md`).

Read the target file if it exists, then classify each distilled rule:

- **Add** — nothing similar exists; it will be appended.
- **Update** — an existing rule covers the same ground but is incomplete or outdated; it will be amended.
  Keep its existing identifier — an updated rule keeps its number.
- **Conflict** — an existing rule says the opposite. Present both versions to the user and
  let them decide which wins; never silently overwrite an existing rule.

## Step 5: Formalise the rule

Write each rule using this exact template:

```markdown
## <category>-<subcategory>-0000: <short title>

**WHEN** <condition that triggers the rule>

**THEN** <rule that should guide the agent>

**Example:**

<specific rule application examples>
```

The heading opens with the rule's identifier: the lowercase category and subcategory joined by
hyphens, then a four-digit number — `domain-common-0001`, `application-framework-0003`.
Numbering is per file and starts at `0001`; a new rule takes the next number after the highest
already in that file. Identifiers are permanent: never renumber existing rules, and never reuse
the number of a deleted one — a gap in the sequence is expected, since these identifiers are how
reviews and commit messages cite a rule.

After the identifier comes a colon and a short title — at most about six words, naming the choice
the rule makes so the file can be skimmed by heading alone. State the position, not the topic:
`One controller class per route`, not `Controllers`. A title may be reworded freely; only the
identifier is fixed.

Keep the WHEN concrete enough that an agent can tell whether it applies,
and the THEN actionable enough that two agents following it would make the same choice.
Ground the example in this repository (real paths, real names) — that is what makes the rule checkable.

Prefer structure over prose in the example: a short list, a before/after table, or a code/path
snippet reads faster than a sentence and is easier to scan when several rules pile up in one file.
For instance:

````markdown
## scaffolding-folders-0002: Domain code sits in per-aggregate folders

**WHEN** adding domain logic to `packages/core`

**THEN** group it under `src/<Aggregate>/`, one folder per aggregate — never a flat top-level file

**Example:**

| Wrong                                   | Right                                            |
|-----------------------------------------|--------------------------------------------------|
| `packages/core/src/MovementService.php` | `packages/core/src/Movement/MovementService.php` |
| `packages/core/src/UserRepository.php`  | `packages/core/src/User/UserRepository.php`      |
````

Show the formalised rule(s) to the user and wait for feedback and confirmation.

## Step 6: Write the rule

Write the confirmed rule(s) to the target file, creating directories and files as needed.
When creating a new file, start it with a `# <Category> / <Subcategory>` heading.
Append new rules at the end, so the file reads in identifier order.
The `## <identifier>` heading is the only separator between rules — do not add horizontal rules.

## Step 7: Simplify and distil the rule

Re-read the rule(s) just written in the target file. Tighten them: cut clauses that restate what the identifier,
WHEN, THEN, or example already make clear; drop asides explaining something a cross-referenced rule already
covers (link to it with its identifier instead of re-explaining it); remove qualifiers, hedges, and extra example
rows that don't change what an agent would do. The WHEN must stay concrete enough to tell whether the rule
applies, and the THEN actionable enough that two agents reading it make the same choice — simplify wording, not
substance, and don't undo a distinction Step 4 or Step 5 confirmed on purpose.

Apply the tightened wording directly to the file — Step 5 already confirmed the rule's content, so this step only
removes excess words around it, without a separate confirmation gate — and mention what was cut when you
summarise the written files at the end.

If rules were set aside in Step 3, restart from Step 3 with them.
When no set-aside rules remain, continue to Step 8.

## Step 8: Point the agent guide at the rules

Run this step only when this session wrote the repository's *first* rule —
`docs/rules/` held no rule files before Step 6. Otherwise skip it.

Read the repository's agent guide. If it already has a section describing `docs/rules/`, there is nothing to do.

Otherwise the rules are invisible: an agent that never opens `docs/rules/` cannot follow them.
Ask the user whether to add a Coding Rules section, showing the exact text and where it would go.
Do not write it unless they agree. Propose this, adjusted to the repository's own paths and tone:

```markdown
## Coding Rules

- `docs/rules/<category>/<subcategory>.md` holds distilled, checkable engineering rules
  (`WHEN` a condition applies, `THEN` what to do, with a repo-grounded example) —
  decisions already made once that should guide every future change in that area.
- Each rule's heading is a permanent identifier followed by a short title —
  `<category>-<subcategory>-<NNNN>: <title>`.
  Cite the identifier when a review comment, commit message, or spec leans on a rule,
  so the reader can find the rule itself rather than re-argue it.
- Before writing or changing code in an area, check `docs/rules/` for a file matching that
  category/subcategory and follow it.
- When a change encodes a decision worth repeating (a correction during review, a convention
  established by a diff), use the `extract-rule` skill to distil it into `docs/rules/`
  instead of leaving it implicit for the next agent to rediscover.
```

Finally, summarise which files were written and you are done.
