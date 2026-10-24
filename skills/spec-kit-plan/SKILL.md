---
name: spec-kit-plan
description: Create a technical implementation plan from a feature spec. Documents architecture, data models, interface contracts, exceptions and the records the change affects, checked against the code as it is, without generating code. Run after spec-kit-clarify.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.2"
---

Create a technical implementation plan from a feature specification.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.
Anything else the user adds (a preferred stack, a constraint) is input to the plan.

**Steps**

1. **Select the change and load artefacts**

   Load `specs/changes/<name>/spec.md`. If it does not exist, prompt to use the `spec-kit-specify` skill first.

   Also load `FRAMEWORK.md` (with `FRAMEWORK.local.md` when present), the capability documents it links to for the enabled standards, the `specs/features/` relevant to the area being changed, and the decision records in `specs/decisions/` that govern it.

2. **Research unknowns**

   If the spec contains unresolved `[NEEDS CLARIFICATION]` markers, pause and suggest using the `spec-kit-clarify` skill first unless the user explicitly wants to proceed.

   List the plan's own unknowns — a dependency to choose, an integration pattern, a behaviour of the existing code — and settle each by reading the code or the dependency's documentation.
   Record each settled unknown under `## Decisions & Rationale` with the alternatives considered.

3. **Write `specs/changes/<name>/plan.md`**

   Structure:

   ```md
   # Plan: <Feature Name>

   ## Technical Context
   <Language and versions, main dependencies, storage, testing tools, target platform, constraints. Only what the code or the user establishes.>

   ## Architecture
   <Bounded context, layers affected, dependency direction. Must comply with FRAMEWORK.md dependency rule.>

   ## Data Models
   <Entities, value objects, aggregates. Identity vs. structural equality. Invariants. Field constraints: required or optional, limits, allowed values, validation rules.>

   ## Interface Contracts
   <Ports, use case signatures, domain events, and what the project exposes to users or other systems (commands, endpoints, public APIs, messages). Technology-agnostic where the layer requires it.>

   ## Implementation Phases
   1. <Phase name> — <what it establishes>
   2. ...

   ## Decisions & Rationale
   | Decision | Rationale | Alternatives Considered |
   |----------|-----------|------------------------|

   ## Exceptions
   | Rule | Trade-off | Simpler alternative rejected | Verification |
   |------|-----------|------------------------------|--------------|

   ## Record Search
   | Record | Search | Disposition |
   |--------|--------|-------------|

   ## Validation Scenarios
   <Runnable scenarios that prove the feature works end to end: prerequisites, the commands to run, expected outcomes.>

   ## Constraints & Risks
   <Known constraints, open technical risks.>
   ```

   Rules:
   - Dependency direction must be `infrastructure -> application -> domain`. Never invert.
   - External dependencies affecting business behaviour must sit behind ports.
   - Repositories are per aggregate root, not per table.
   - No framework names in domain or application layer design.
   - Contexts meet through a contract in a shared kernel or through a domain event, never by importing each other (not even another context's application services).
   - **An exception to a governing rule** is recorded under `## Exceptions` with all four columns, or not at all; write `None.` where there is none.
     `spec-kit-analyse` accepts a recorded exception where the trade-off holds and the verification exists, and treats one missing a column as a violation.
   - **`## Record Search` lists every living specification, decision record and document the change makes untrue**, found by searching `specs/features/`, `specs/decisions/` and the project's documentation for the terms the change alters — searching for the concept's words as well as its spellings, since a page that says "beside the feature spec" states a placement a path search misses.
     Each row says how it was found and its disposition: updated by the change (and how), or unaffected (and why).
     A change that reverses a decision record says so and cites the user's decision; reversing a recorded decision is never an amendment the plan makes on its own.
     Write `None found.` with the searches made when nothing is affected.
   - `## Validation Scenarios` is a guide to run, not an implementation: link to the contracts and data models rather than repeating them, and include no implementation code, migrations or full test suites.

4. **Check the plan against what is actually there**

   When the change modifies something that already exists, read it before describing it.
   A plan reads as authoritative, so each of these mistakes survives review unless it is checked here:

   - **Thresholds and comparisons.** Quote the operator and the constant from the code rather than paraphrasing them.
     A plan that says "at or above the limit" over code that tests `> limit` sends the implementer to change working code, or to write a test that encodes the plan's version of the rule.
   - **Configuration a requirement silently depends on.** Before recording something as out of scope, check whether a requirement needs it: a permission, a build or deployment setting, a cache key, a checkout depth.
   - **Counts, enumerations and places in the code.** Derive a set ("the files that do X") from the code with a search, not from a sample, and record the search so the implementer can repeat it.
     Name a place in the code by something searchable — a function, a type, a distinctive string — never by a line number, which an edit elsewhere moves.
   - **Readers of what the change alters, not just its producer.** Before settling the shape of an identifier, message, format, flag or endpoint the change alters, search the whole repository for every reader of it, code and tests, as the code spells it, and record the search.
     Text another part of the code already parses is a format: adding a field or marker to it is safe only once that parser is found and checked, and it is usually not in the file being edited.
     Name every test outside the change that reads an altered thing, so `spec-kit-tasks` can give it a task: it is the test the change would otherwise leave stale.
   - **A special case walks every step that reads the fact it alters**, not only the step that introduces it, and the plan says what each one now does.
   - **A shared outcome is not proof that every producer handles the new case.**
     When one outcome (a status, an error, a halt) can come from several triggers, check each producer by name; and a consumer that treats a new value generically can still print a hard-coded sentence beside it that is untrue for the new case.
   - **An exception to a rule names every restatement of that rule.** A rule is often stated in several places — a standard, a skill, a document — and each restatement is a surface the exception must amend; search for the rule's wording.
   - **Key an exemption from a safety check on the state that makes it safe**, observed where it applies, never on a record that can outlive that state.
   - **Commits you promise must be separable.** Before planning two behaviours in one file as two commits, check they divide cleanly; when they are woven through one function, plan one commit whose message explains both.
   - **The project's own templates govern the plan's sections.** Where `FRAMEWORK.local.md` or the project's documentation requires further plan sections, add them.

5. **Constitution check**

   Before finishing, and again after the design is complete, verify the plan does not violate any FRAMEWORK.md non-negotiable rule.
   A violation is fixed in the plan, or recorded as an exception under `## Exceptions`; it is never left unstated.

**Output**

After writing the plan:
- Confirm file location.
- Highlight any architecture decisions, exceptions and affected records worth the user's attention.
- Next step: "Use the `spec-kit-tasks` skill to generate the task list." Optionally, the `spec-kit-checklist` skill can first audit the requirements for a domain (security, UX, an API).

**Guardrails**
- No code generation — plan only.
- If the spec has unresolved clarifications that affect architecture, surface them rather than guessing.
- Protect the domain model first; adapt infrastructure around it.
- Never change what the spec asks for; a requirement the plan cannot meet goes back to the user.
