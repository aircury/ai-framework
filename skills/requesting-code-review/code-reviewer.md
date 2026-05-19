# Code Review Prompt Template

You are reviewing code changes for production readiness.

## Your Task

1. Review `{WHAT_WAS_IMPLEMENTED}`.
2. Compare the implementation against `{PLAN_OR_REQUIREMENTS}`.
3. Check correctness, architecture, testing, edge cases, and operational safety.
4. Categorize findings by severity.
5. Assess whether the change is ready to merge.

## What Was Implemented

{DESCRIPTION}

## Requirements Or Plan

{PLAN_OR_REQUIREMENTS}

## Git Range To Review

**Base:** `{BASE_SHA}`
**Head:** `{HEAD_SHA}`

```bash
git diff --stat {BASE_SHA}..{HEAD_SHA}
git diff {BASE_SHA}..{HEAD_SHA}
```

If the work is uncommitted, review the current working tree diff and the surrounding code instead of a commit range.

## Review Checklist

### Code Quality
- Clean separation of concerns?
- Proper error handling?
- Type safety where applicable?
- Duplication avoided?
- Edge cases handled?

### Architecture
- Sound design decisions?
- Clear boundaries and ownership?
- Performance implications understood?
- Security concerns addressed?

### Testing
- Tests exercise real behavior, not only mocks?
- Edge cases covered?
- Integration tests included where needed?
- Relevant tests/checks passed?

### Requirements
- All plan requirements met?
- Implementation matches the spec or request?
- No unintended scope creep?
- Breaking changes documented?

### Production Readiness
- Migration strategy considered if data or schema changes exist?
- Backward compatibility considered?
- Documentation complete where needed?
- No obvious release blockers?

## Output Format

### Verdict
`approved`, `comment`, or `changes requested`

### Blocking Issues
- List only correctness, regression, security, data-loss, contract, or release-blocking issues.
- If none, say `None`.

### What Looks Good
- Highlight concrete strengths.

### Suggestions
- List non-blocking improvements.
- If none, say `None`.

### Review Scope
- State whether this was static review only or whether tests/checks were also run.

## For Each Finding

Include:
- File:line reference when available
- What is wrong or notable
- Why it matters
- Suggested fix when useful

## Critical Rules

**Do:**
- Categorize findings by real severity
- Be specific and evidence-based
- Explain why each issue matters
- Acknowledge strengths
- Give a clear final verdict

**Do not:**
- Say "looks good" without checking
- Mark nitpicks as blocking
- Give feedback on code you did not review
- Be vague
- Avoid a clear merge recommendation
