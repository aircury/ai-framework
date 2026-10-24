---
name: spec-kit-specify
description: Create a feature specification from a user description, with identified user stories, requirements and edge cases. Focuses on WHAT and WHY, never HOW. Use at the start of a spec-kit workflow.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Create a feature specification from a natural language description.

**Input**: Feature description. If not provided, ask the user what they want to build.

**Steps**

1. **Collect the feature description**

   The text the user gave with the request is the feature description; do not ask them to repeat it.
   If it is missing or too vague to identify actors and actions, ask:
   > "What feature do you want to specify? Describe what it should do and why."

   Derive a short kebab-case name of two to four words, action-noun where possible,
   keeping technical terms and acronyms
   (e.g., "add user authentication" → `user-auth`, "fix payment processing timeout" → `fix-payment-timeout`).

2. **Create the change directory**

   Create `specs/changes/<name>/`.
   One feature per run.

   `specs/changes/` is gitignored. Only `specs/features/` is canonical and versioned.

3. **Read what already governs the area**

   Before writing, read the living specifications in `specs/features/` and the decision records in `specs/decisions/` (where the project keeps them) that cover the area the feature touches, and `FRAMEWORK.md` (with `FRAMEWORK.local.md` when present).
   The spec builds on the rules already in force; it does not silently restate or contradict them.

4. **Write `specs/changes/<name>/spec.md`**

   Structure:

   ```md
   # Spec: <Feature Name>

   ## Problem
   <Why this feature is needed.>

   ## Goals
   <What success looks like, in measurable, technology-agnostic terms.>

   ## Non-Goals
   <What is explicitly out of scope.>

   ## User Stories
   - US-1: As a <role>, I want <goal> so that <benefit>. [P1]
     Independent test: <how this story alone can be demonstrated to work>

   ## Requirements
   ### FR-01: <one behaviour the system must have>
   - WHEN <situation> THEN <observable outcome>

   ## Edge Cases
   ### <a surface the change alters: a screen, a command, an endpoint, a message>
   - FR-02: on failure — WHEN <it fails> THEN <what the person or caller sees>
   - FR-03: while waiting — WHEN <it has not answered yet> THEN <...>
   - FR-04: with nothing to show — WHEN <there is no data> THEN <...>
   - FR-05: after closing and reopening — WHEN <it is dismissed and opened again> THEN <...>
   - FR-06: on a repeated or concurrent action — WHEN <it is triggered twice> THEN <...>
   - FR-07: with hostile or malformed input — WHEN <outside input arrives malformed or crafted> THEN <...>
   - <state>: cannot arise, because <reason>
   - None: the change alters no screen, command, endpoint or message, because <reason>

   ## Key Entities
   <Only when data is involved: each entity, what it represents, its key attributes and relationships, without implementation.>

   ## Success Criteria
   - SC-01: <measurable, technology-agnostic outcome>

   ## Assumptions
   - <informed default taken> — <why it is the safe reading>

   ## Open Questions
   - [NEEDS CLARIFICATION] <question> — impact: <scope|security|ux|technical>
   ```

   Remove an optional section that does not apply (Key Entities, for instance) rather than writing "N/A".

   Rules:
   - Focus on WHAT and WHY. Never describe HOW or name technologies.
   - Written for business stakeholders, not developers.
   - Align with FRAMEWORK.md governing principles.
   - **Every item carries an identifier.**
     User stories are `US-n`, with a priority (`P1` is the most important) and an independent test.
     Requirements are `FR-nn`; success criteria are `SC-nn`.
     Identifiers are never reused or renumbered within the change's life, so later artefacts can cite them.
   - **One behaviour per requirement.**
     Each requirement states one behaviour and has at least one WHEN/THEN scenario, in the form `specs/features/` uses.
     Split a compound requirement, so that a partly met one shows as such.
   - **Every surface the change alters decides its states** under `## Edge Cases`:
     failure, waiting, nothing to show, closing and reopening, a repeated or concurrent action.
     Each decided state is a requirement of its own with a scenario, or one line saying why the state cannot arise.
     A surface that takes input from a person, another agent or another system also decides its hostile or malformed input state the same way.
     A change that alters no surface says so there, with why.
   - **The default for an edge case is the rule already in force.**
     Cite the living specification or decision record that already decides it.
     A state no existing rule covers, and no reasonable default settles, is an open question, not a new design.
   - **Make informed defaults** for unspecified details, using context and common practice, and record each under Assumptions with why it is the safe reading.
     A decided default is a requirement; its reason is the assumption.
     Do not ask about details that have a reasonable default (data retention, conventional error handling, ordinary performance expectations).
   - **Success criteria are measurable, technology-agnostic, user-focused and verifiable** without knowing the implementation.
     "Users complete checkout in under three minutes" is a criterion; "the API answers in under 200 ms" or "the cache hit rate exceeds 80%" is an implementation detail.
   - Maximum 3 `[NEEDS CLARIFICATION]` markers, only where the choice significantly changes scope or user experience, several readings are reasonable, and no default exists.
     Prioritise them by scope > security and privacy > UX > technical. Make informed guesses for the rest.
   - Do not embed checklists in the spec.

5. **Validate the spec against a quality checklist**

   Write `specs/changes/<name>/checklists/requirements.md`:

   ```md
   # Specification Quality Checklist: <Feature Name>

   **Purpose**: Validate the specification before planning.
   **Feature**: [spec.md](../spec.md)

   ## Content Quality
   - [ ] No implementation details (languages, frameworks, APIs)
   - [ ] Focused on user value and business needs
   - [ ] Written for non-technical stakeholders
   - [ ] All mandatory sections completed

   ## Requirement Completeness
   - [ ] No [NEEDS CLARIFICATION] markers remain
   - [ ] Every story, requirement and success criterion carries its identifier
   - [ ] Every requirement states one behaviour and has a WHEN/THEN scenario
   - [ ] Requirements are testable and unambiguous
   - [ ] Success criteria are measurable and technology-agnostic
   - [ ] Every surface the change alters has its edge-case states decided
   - [ ] Scope is clearly bounded
   - [ ] Dependencies and assumptions are identified

   ## Feature Readiness
   - [ ] Every user story has an independent test
   - [ ] User stories cover the primary flows
   - [ ] No implementation details leak into the specification
   ```

   Review the spec against each item and tick only those that pass, quoting the spec section for each that fails.
   Fix the spec for every failing item other than open questions, and validate again, up to three times.
   If items still fail after the third iteration, note the remaining issues under the checklist and tell the user.
   This checklist is maintained by this skill and `spec-kit-clarify`; checklists written by `spec-kit-checklist` belong to the reviewer.

**Output**

After writing the spec, summarise:
- Change name and file location.
- Stories, requirements and success criteria counted by identifier.
- Checklist result: items passing out of the total, and any still failing.
- Number of open questions (if any).
- Next step: "Use the `spec-kit-clarify` skill to resolve open questions, or the `spec-kit-plan` skill if the spec is clear."

**Guardrails**
- If a change with that name already exists, ask if the user wants to continue it or create a new one.
- Never include HOW — no tech stack, frameworks, or implementation details in the spec.
- Prefer making reasonable assumptions over asking unnecessary questions.
- Never contradict a living specification or decision record without saying so as an open question.
