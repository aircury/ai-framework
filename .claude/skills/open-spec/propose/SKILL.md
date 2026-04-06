---
name: open-spec/propose
description: Propose a change with optional working artifacts. Use when the user wants a structured proposal with design notes, tasks, and a clear path to implementation.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Propose a new change and create optional working artifacts.

I'll create a change with artifacts:
- proposal.md (what & why)
- design.md (how)
- tasks.md (implementation steps)

When ready to implement, use the `open-spec/apply` skill

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Create the change directory**

   Create `specs/changes/<name>/`.

   `specs/changes/` is gitignored. It is optional workflow scaffolding. Only `specs/features/` is canonical and versioned.

3. **Create the working artifacts**

   Use the **TodoWrite tool** to track progress.

   Create:

   - `proposal.md`: problem, goals, non-goals, scope
   - `design.md`: architecture, decisions, tradeoffs, boundaries
   - `tasks.md`: concrete implementation steps with checkboxes

   Artifact rules:

   - Keep them technology-aware if helpful for delivery.
   - Keep them aligned with `AGENTS.md`, TDD, Hexagonal Architecture, and DDD.
   - Use `specs/features/` as the canonical behavior baseline.
   - If the change modifies existing behavior, reference the affected canonical specs.
   - If the user already gave enough detail, write the artifacts directly instead of asking more questions.

4. **Ensure the change is implementation-ready**

   Before finishing, make sure:

   - `proposal.md` explains why the change exists.
   - `design.md` explains the intended approach and boundaries.
   - `tasks.md` contains an ordered execution plan.
   - The change name and artifacts are specific enough that the `open-spec/apply` skill can execute them.

**Output**

After completing all artifacts, summarize:
- Change name and location
- List of artifacts created with brief descriptions
- What's ready: "All artifacts created! Ready for implementation."
- Prompt: "Use the `open-spec/apply` skill to implement. When done, use the `open-spec/complete` skill to sync `specs/features/` and clean up these ephemeral artifacts."

**Guardrails**
- Create all three core artifacts unless the user explicitly asks for less
- If context is critically unclear, ask the user - but prefer making reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next
- Never treat working artifacts as canonical specs
