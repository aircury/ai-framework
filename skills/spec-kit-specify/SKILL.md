---
name: spec-kit-specify
description: Create a feature specification from a user description. Focuses on WHAT and WHY, never HOW. Use at the start of a spec-kit workflow.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Create a feature specification from a natural language description.

**Input**: Feature description. If not provided, ask the user what they want to build.

**Steps**

1. **Collect the feature description**

   If input is missing or vague, ask:
   > "What feature do you want to specify? Describe what it should do and why."

   Derive a kebab-case name (e.g., "add user authentication" → `user-auth`).

2. **Create the change directory**

   Create `specs/changes/<name>/`.

   `specs/changes/` is gitignored. Only `specs/features/` is canonical and versioned.

3. **Write `specs/changes/<name>/spec.md`**

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
   - As a <role>, I want <goal> so that <benefit>. [P1/P2/P3]

   ## Success Criteria
   <Testable, technology-agnostic acceptance criteria.>

   ## Open Questions
   - [NEEDS CLARIFICATION] <question> — impact: <scope|security|ux|technical>
   ```

   Rules:
   - Focus on WHAT and WHY. Never describe HOW or name technologies.
   - Maximum 3 `[NEEDS CLARIFICATION]` markers, prioritized by scope > security > UX > technical.
   - Make informed, reasonable defaults for unspecified details.
   - Written for business stakeholders, not developers.
   - Align with FRAMEWORK.md governing principles.

4. **Validate quality**

   Before finishing, verify:
   - All success criteria are measurable and technology-agnostic.
   - No implementation details or framework names appear.
   - User stories have priorities.
   - Open questions are minimal and high-impact.

**Output**

After writing the spec, summarize:
- Change name and file location.
- Number of open questions (if any).
- Next step: "Use the `spec-kit-clarify` skill to resolve open questions, or the `spec-kit-plan` skill if the spec is clear."

**Guardrails**
- If a change with that name already exists, ask if the user wants to continue it or create a new one.
- Never include HOW — no tech stack, frameworks, or implementation details in the spec.
- Prefer making reasonable assumptions over asking unnecessary questions.
