---
name: goal-crafting
description: Generate, improve, and validate Claude Code /goal prompts that are specific, scoped, verifiable, and safe. Use when the user asks to create, rewrite, improve, or evaluate a /goal.
license: MIT
compatibility: Claude Code /goal command.
metadata:
  author: Aircury
  version: "1.0"
---

Create high-quality Claude Code `/goal` prompts.

This skill turns rough intent into an executable session goal with clear scope, constraints, verification, and success criteria. It produces goal text for the user to paste; it neither runs `/goal` itself nor performs the goal's implementation work, unless the user explicitly asks to continue after the goal is written.

`/goal` installs a session Stop hook that blocks the turn from ending until the condition holds, then auto-clears. So the Success criteria is not framing prose — it is the predicate that hook evaluates, and the agent keeps working against it rather than pausing to ask.

## Input

The user may provide:

- A rough task, bug report, feature idea, refactor, review request, migration, UI change, or investigation target.
- An existing `/goal` that should be improved or reviewed.
- Partial context from a project, spec, ticket, error, screenshot, or conversation.

## Workflow

When the input is an existing `/goal` to review rather than a new one to write, skip steps 1 and 2: run it through the step 5 quality checks, report what fails, and produce the corrected version.

1. **Classify the goal type**

   Choose the closest type:

   - Investigation
   - Bug fix
   - Feature implementation
   - Refactor
   - Review
   - Planning or specification
   - UI work
   - Migration
   - Cleanup

   The type sets the defaults for later steps:

   | Type                  | Default work mode          | Typical success criteria        |
   |-----------------------|----------------------------|---------------------------------|
   | Investigation, Review | Do not edit files          | Findings delivered              |
   | Bug fix               | Reproduce, then fix        | Failing test now passes         |
   | Feature, Migration    | Propose before editing     | Build and tests green           |
   | Planning              | No code                    | Written plan delivered          |
   | Refactor, Cleanup     | Smallest safe change       | Behaviour unchanged, tests green|

   Override a default when the user's context calls for it, but never silently
   downgrade a read-only type into one that edits files.

2. **Ask only for critical missing information**

   Use the hybrid policy:

   - If the available context is enough, draft the `/goal` directly.
   - If a missing answer would materially change the goal, ask before drafting.
   - Ask at most one round of questions before producing a draft: a single AskQuestion call carrying up to three or four grouped decisions, not three separate rounds.
   - Prefer safe defaults for low-risk gaps and state assumptions inside the generated goal.

3. **Use structured questions when possible**

   These questions belong to the drafting stage, **before** the `/goal` is issued. Once a goal is active the agent should not stop to ask except when genuinely blocked, so anything still undecided must be written into the goal as a stated assumption or a constraint rather than deferred to a later question.

   When the missing decision can be expressed as options, use the IDE AskQuestion tool behavior from the `ask-question` skill instead of asking in plain chat.

   Good option-based questions include:

   - Work mode: investigate first, implement directly, propose before implementation, or review only.
   - Risk tolerance: smallest safe change, broader cleanup allowed, or exploratory refactor.
   - Verification depth: focused tests only, full test suite, lint/typecheck/build, or manual verification.
   - Scope boundary: frontend only, backend only, full stack, docs/specs only.

   Plain chat is allowed only when the user must provide free text that cannot be represented as options, such as a custom ticket id, endpoint name, error message, or product wording.

4. **Draft the `/goal`**

   Produce a ready-to-paste Claude Code goal using this structure when useful:

   ```text
   /goal <Primary outcome>

   Context:
   <Why this work exists and what area matters.>

   Objective:
   <Observable result to achieve.>

   Scope:
   <Included files, modules, flows, behaviours, or systems.>

   Out of scope:
   <Explicit exclusions and changes not authorised.>

   Constraints:
   <Compatibility, architecture, style, APIs, data, design, security, or performance rules.>

   Work mode:
   <How the agent should proceed.>

   Verification:
   <Checks that should be run or evidence that should be collected.>

   Success criteria:
   <Concrete condition for completion.>

   Communication:
   <When to ask, when to assume, and final reporting expectations.>
   ```

   Always required: the primary outcome, Scope, Verification, and Success criteria. Include the remaining sections only when they would change how the agent behaves. For a small, low-risk task a four-section goal beats a nine-section one — every filler section dilutes the ones that matter. Keep the whole goal under roughly 30 lines; if it runs longer, the outcome is doing the work of several goals and should be split.

   **When the goal produces an artefact** — a report, note, plan, or audit — two things must line up or the goal contradicts itself:

   - Scope and Out of scope must authorise that one write explicitly, e.g. "the only write authorised is creating the note; do not modify existing project files". A read-only scope plus a success criterion that requires a file is a goal the agent cannot satisfy.
   - Say where it lands. Default findings about vulnerabilities, credentials, or incidents to a scratch location, not a repository path — writing an exploitation map into the repo it describes widens the exposure. Put it in the repo only when the user chose that.

   A minimal bug fix goal, complete as written:

   ```text
   /goal Fix the 500 on POST /api/invoices when the customer has no billing address

   Scope:
   The invoice creation handler and its validation layer.

   Verification:
   Add a test covering the missing-address case; run the invoice test suite.

   Success criteria:
   The new test fails before the fix and passes after it, with the rest of the
   invoice suite still green.
   ```

5. **Validate quality before final output**

   Check that the drafted goal is:

   - Terminable: the Success criteria is the predicate the Stop hook evaluates, so if it cannot be answered yes or no by inspecting files, command output, or a delivered artefact, rewrite it. Apply the termination test: *which command or inspection demonstrates this is finished?* No answer means the goal is not ready.
   - Consistent: no section forbids what another requires. Read Scope and Out of scope against Success criteria specifically — that pair is where contradictions hide.
   - Self-contained: everything needed is inside the goal text. An assumption explained in your surrounding message but absent from the goal does not exist, because only the goal text survives into the session.
   - Focused: the outcome names one result. Several unrelated questions bolted onto one goal belong in separate goals.
   - Scoped, verifiable, and safe: inclusions and exclusions are explicit, completion is provable, and risky changes have boundaries.

## Output

Return:

- `Recommended /goal`: a ready-to-paste goal in a fenced `text` block.
- `Why this works`: 2-5 concise bullets explaining the structure.
- `Assumptions`: only when assumptions were made.
- `Optional variants`: only when the user would benefit from choosing between materially different versions.

When reviewing an existing `/goal`, return:

- `Findings`: concrete weaknesses or risks in the current goal.
- `Improved /goal`: a corrected ready-to-paste version.
- `What changed`: concise explanation of improvements.

## Guardrails

- Do not pre-authorise irreversible or outward-facing actions inside the goal: pushing, deploying, deleting data, running production migrations, sending messages, publishing. The goal persists for the whole session and removes the confirmation point that would otherwise catch these. When such a step is genuinely needed, word it as "prepare the change and wait for explicit user confirmation".
- Do not write open-ended or watchdog goals such as "keep the tests passing" or "monitor for errors". `/goal` blocks the turn from ending until the condition holds, so a goal with no finish condition traps the session. Reframe it as a state reachable once.
- Do not implement the generated goal during this skill unless the user explicitly asks to continue after accepting it.
- Do not ask questions whose answers can be safely assumed without changing the outcome.
- Do not produce vague goals such as "improve the app" or "fix bugs" without scope and verification, and do not hide scope expansion inside a goal that reads as narrow.
- Include implementation constraints when they protect architecture, compatibility, public contracts, data integrity, security, or design-system fidelity; leave them out when the user wants product, planning, review, or investigation direction.
- Do not invent project facts. If project-specific facts are unknown, phrase them as assumptions or leave them generic.
