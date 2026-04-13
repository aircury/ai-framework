---
name: spec-kit-plan
description: Create a technical implementation plan from a feature spec. Documents architecture, data models, and interface contracts without generating code. Run after spec-kit-clarify.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Create a technical implementation plan from a feature specification.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Select the change and load artifacts**

   Load `specs/changes/<name>/spec.md`. If it does not exist, prompt to use the `spec-kit-specify` skill first.

   Also load `specs/features/` relevant to the area being changed.

2. **Research unknowns**

   If the spec contains unresolved `[NEEDS CLARIFICATION]` markers, pause and suggest using the `spec-kit-clarify` skill first unless the user explicitly wants to proceed.

3. **Write `specs/changes/<name>/plan.md`**

   Structure:

   ```md
   # Plan: <Feature Name>

   ## Architecture
   <Bounded context, layers affected, dependency direction. Must comply with FRAMEWORK.md dependency rule.>

   ## Data Models
   <Entities, value objects, aggregates. Identity vs. structural equality. Invariants.>

   ## Interface Contracts
   <Ports, use case signatures, domain events. Technology-agnostic.>

   ## Implementation Phases
   1. <Phase name> — <what it establishes>
   2. ...

   ## Decisions & Rationale
   | Decision | Rationale | Alternatives Considered |
   |----------|-----------|------------------------|

   ## Constraints & Risks
   <Known constraints, open technical risks.>
   ```

   Rules:
   - Dependency direction must be `infrastructure -> application -> domain`. Never invert.
   - External dependencies affecting business behavior must sit behind ports.
   - Repositories are per aggregate root, not per table.
   - No framework names in domain or application layer design.
   - Cross-context communication via domain events or application services only.

4. **Constitution check**

   Before finishing, verify the plan does not violate any FRAMEWORK.md non-negotiable architecture rules.

**Output**

After writing the plan:
- Confirm file location.
- Highlight any architecture decisions worth the user's attention.
- Next step: "Use the `spec-kit-analyze` skill to validate consistency across artifacts, or the `spec-kit-tasks` skill to generate the task list."

**Guardrails**
- No code generation — plan only.
- If the spec has unresolved clarifications that affect architecture, surface them rather than guessing.
- Protect the domain model first; adapt infrastructure around it.
