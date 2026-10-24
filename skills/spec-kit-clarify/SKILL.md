---
name: spec-kit-clarify
description: Resolve ambiguities in a feature spec through targeted Q&A, one question at a time, recording each answer in spec.md as it is given. Run after spec-kit-specify when open questions remain, and before spec-kit-plan.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Resolve ambiguities in a feature spec through focused, sequential questioning.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.
Anything else the user adds is context for prioritising the questions.

Run this before `spec-kit-plan`.
If the user explicitly skips it (an exploratory spike, say), proceed, but warn that the risk of rework downstream increases.

**Steps**

1. **Select the change**

   Auto-select if only one directory exists under `specs/changes/`. Otherwise ask.

2. **Load `specs/changes/<name>/spec.md`**

   If it does not exist, prompt the user to use the `spec-kit-specify` skill first; never create a spec here.
   Also read `FRAMEWORK.md` (with `FRAMEWORK.local.md` when present) for the constraints the answers must respect.

3. **Scan for ambiguities**

   Mark each category Clear, Partial or Missing (in priority order):
   - Functional scope — goals, out-of-scope declarations, unclear boundaries or behaviour, roles
   - Domain and data — entities, identity and uniqueness, states and transitions, volume
   - UX flows — missing user journeys; a changed surface's failure, waiting, empty, reopened or concurrent state, or an input-taking surface's hostile-input state, left undecided
   - Non-functional — unspecified performance, scale, reliability, observability, security, privacy or compliance
   - Integrations — external dependencies and how they fail
   - Terminology — ambiguous or inconsistent domain language
   - Testability — a vague adjective ("robust", "intuitive"), or acceptance no test could settle
   - Placeholders — TODOs and undecided items

   Every Partial or Missing category is a candidate question, unless the answer would not change the implementation or how it is validated,
   or it is about implementation method, a tech-stack comparison or the task breakdown: those belong to planning, not here.
   Every `## Open Questions` entry the spec raised is asked, or the summary says why it was not.
   Queue the candidates by impact times uncertainty, highest first: one high-impact area (a security posture, say) comes before two low-impact ones.

4. **Verify each question's premise before asking it**

   A question carries its premise to the user as established fact, and they answer the question asked rather than the one that should have been.
   When a question rests on how the system currently behaves — a setting that exists, a field that is read, a rule that is enforced — read the code it is about before asking, not the code you remember.

5. **Ask one question at a time**

   Never reveal the queued questions in advance.
   Ask only if the answer materially affects architecture, data modelling, task breakdown, testing, UX, operations or compliance.

   Each question:
   - Leads with `**Question:**` and a full interrogative ending in `?` that makes sense on its own.
     Never use a topic label, a heading or a requirement id as the question.
     A requirement id may follow the `?` in brackets: `**Question:** <interrogative>? (FR-03)`.
   - Is followed by one plain-language sentence on why it matters for acceptance or shipping.
     Use everyday words; a reader who does not know Spec Kit must be able to answer from the question alone.
   - Offers either 2–5 mutually exclusive options, or asks for a short answer (five words or fewer).
   - Recommends one option (or suggests an answer) with one or two sentences of reasoning: best practice for the project type, risk reduction, and the goals and constraints the spec states.

   When the answer can be expressed as options, ask through the `ask-question` skill where it is installed, the recommended option first; otherwise put the options in a table and accept the option letter, "yes" for the recommendation, or a short answer of their own.
   If an answer is ambiguous, ask a quick follow-up on the same question before moving on.

   In an unattended run (`FRAMEWORK.md § Unattended runs`), nobody will answer: take the recommended option, record it under `## Assumptions` with its reason, and send any decision that genuinely needs a person through the run's escalation path.

6. **Record each answer before asking the next question**

   After each accepted answer, update `spec.md` and save it:
   - Under `## Clarifications` (created after the opening sections if missing), in a `### Session YYYY-MM-DD` subsection for today, append `- Q: <question> → A: <answer>`.
   - Apply the answer to the section it belongs in: a requirement and its scenario, a user story, a key entity, a success criterion (turn a vague adjective into a measurable target), an edge case, or the terminology (normalise the term everywhere, noting `(formerly "X")` once if needed).
     A new requirement gets the next unused `FR-nn`; existing identifiers keep their numbers.
   - Replace any statement the answer makes obsolete instead of adding beside it; leave nothing contradictory.
   - Remove the `[NEEDS CLARIFICATION]` marker the answer resolves.
   - Keep the change minimal and testable, and keep unrelated sections and the heading hierarchy as they were.

7. **Stop when the material ambiguities are resolved**

   There is no fixed question limit.
   Stop when every material ambiguity is resolved, or when the user says to stop ("done", "proceed").
   Flag anything still unresolved explicitly in the spec.

8. **Re-validate the spec quality checklist**

   If `specs/changes/<name>/checklists/requirements.md` exists, re-evaluate each of its checkbox items against the updated spec.
   Toggle only the markers whose state changed, and change nothing else in the file.
   Note which items now pass, which regressed, and which still fail.

**Output**

After the questions end:
- Number of questions asked and answered, and the sections of `spec.md` they touched.
- Checklist status, when it was re-validated: before and after counts (e.g., "12/16 → 15/16 passing"), and the items that changed or still fail.
- A coverage table: each category with its status — Resolved, Deferred (belongs to planning, or the user stopped), Clear, or Outstanding (still partial but low impact).
- Next step: "Use the `spec-kit-plan` skill to create the technical implementation plan."
  If anything is Outstanding or Deferred, say whether to proceed to planning or to clarify again.

**Guardrails**
- If no material ambiguity is found, say "No critical ambiguities detected worth formal clarification." with the coverage table, and suggest the `spec-kit-plan` skill.
- Always save after each answer — never batch updates.
- Never introduce implementation details into the spec during clarification.
- Never ask about the tech stack unless its absence blocks functional clarity.
