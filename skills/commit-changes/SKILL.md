---
name: commit-changes
description: Analyses git changed files in the workspace and makes atomic, functional, and semantic commits using conventional commits format. Use when the user asks to commit changes, create commits from staged/unstaged files, or organise working tree changes into meaningful commits.
license: MIT
metadata:
  author: Aircury
  version: "1.0"
---

When committing changes, follow this workflow:

1. **Analyze the workspace**: Run `git status` and `git diff` (staged and unstaged) to understand all changes.

2. **Group changes semantically**: Identify logical units of work. Each commit must be atomic — one functional change per commit. Group related files that together implement a single concern.

3. **Write conventional commit messages**: Use the format `<type>(<scope>): <description>` without a body. Allowed types:
   - `feat`: new feature
   - `fix`: bug fix
   - `refactor`: code restructuring without behavior change
   - `docs`: documentation only
   - `style`: formatting, whitespace, semicolons (no logic change)
   - `test`: adding or updating tests
   - `chore`: tooling, configs, dependencies
   - `perf`: performance improvement
   - `ci`: CI/CD changes
   - `build`: build system changes
   - `revert`: reverting a previous commit

4. **Commit rules**:
   - One-line messages only — never use a commit body.
   - Never include commit bodies, trailers, co-author lines, AI/tool attribution, generated-by markers, bot signatures, or metadata implying AI involvement.
   - Use `git add` for specific files per commit, never `git add .` unless all changes belong to one commit.
   - After each commit, run `git log -1 --format=%B` and verify the final message contains no AI-related attribution or metadata, then run `git status` to verify success.

5. **Execution order**: Stage and commit one group at a time. Do not skip ahead.
