---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
license: MIT
metadata:
  author: Aircury
  version: "1.0"
---

# Requesting Code Review

Use this skill to run an independent review before you move on or merge.

**Core principle:** review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing a major feature
- Before merging to the main branch

**Optional but valuable:**
- When stuck and you need a fresh perspective
- Before refactoring, to get a baseline check
- After fixing a complex bug

## How to Request Review

### 1. Capture the review range

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

If the work is still uncommitted, review the current working tree diff plus the surrounding code instead of a commit range.

### 2. Use an independent reviewer

Use your platform's delegation or task tool to dispatch an independent code-review agent/subagent.
If your environment does not support delegated reviewers, perform a separate second-pass review yourself against the diff and the surrounding code.

Fill the template in `code-reviewer.md` with:
- `{WHAT_WAS_IMPLEMENTED}` — what you just built
- `{PLAN_OR_REQUIREMENTS}` — what it should do
- `{BASE_SHA}` — starting commit
- `{HEAD_SHA}` — ending commit
- `{DESCRIPTION}` — brief summary

### 3. Act on feedback

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later when appropriate
- Push back if feedback is incorrect, with technical reasoning and evidence

## Example

```text
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch independent reviewer]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Reviewer returns]
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed with fixes

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-driven development:**
- Review after each task
- Catch issues before they compound
- Fix problems before moving to the next task

**Executing plans:**
- Review after each batch
- Apply important feedback before continuing

**Ad-hoc development:**
- Review before merge
- Review when stuck

## Using This Workflow For GitHub PR Reviews

When reviewing an existing GitHub PR with this skill:

1. Gather the PR context first: title, base and head branches, changed files, and full diff.
2. Review the diff plus the relevant surrounding code, not the diff alone.
3. Distinguish clearly between:
   - **blocking issues** — correctness, logic, regression, security, or contract problems
   - **non-blocking suggestions** — clarity, naming, style, maintainability
4. State the review scope explicitly, including whether you ran tests/checks or did a static review only.
5. If the user asks you to post the review, add a top-level PR comment summarizing the verdict.

Preferred summary structure:
- Short verdict line: `approved`, `comment`, or `changes requested`
- `Blocking issues`
- `What looks good`
- `Suggested fix` or `Suggestions`
- Short note on review scope

## Red Flags

**Never:**
- Skip review because the change "looks simple"
- Ignore Critical issues
- Proceed with unfixed Important issues without an explicit reason
- Argue with valid technical feedback

**If the reviewer is wrong:**
- Push back with technical reasoning
- Show code, tests, or behavior that supports your conclusion
- Request clarification when needed

See template: `code-reviewer.md`
