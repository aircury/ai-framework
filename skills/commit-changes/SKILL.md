---
name: commit-changes
description: Analyses git changed files in the workspace and makes atomic, functional, and semantic commits using conventional commits format. Use when the user asks to commit changes, create commits from staged/unstaged files, or organise working tree changes into meaningful commits.
license: MIT
metadata:
  author: Aircury
  version: "1.1"
---

When committing changes, follow this workflow:

This skill creates ordinary, new commits from reviewed staged changes only.
It must never create a merge commit or squash commits:
do not run `git merge`, `git merge --no-ff`, `git merge --squash`,
`git rebase --autosquash`, `git commit --amend` to fold commits together,
or any equivalent history-combining operation.

1. **Analyze the workspace**: Run `git status` and `git diff` (staged and unstaged) to understand all changes.

2. **Group changes semantically**: Identify logical units of work. Each commit must be atomic — one functional change per commit. Group related files that together implement a single concern.

3. **Write conventional commit messages**: Use the format `<type>(<scope>): <description>`, optionally followed by a body. Allowed types:
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

   **The project's own convention comes on top of this format.**
   Before writing the first message, read what the project says about
   commits — its `README.md` (a Contributing section), `CONTRIBUTING.md`,
   `FRAMEWORK.local.md` or equivalent — and look at its recent `git log`.
   A project may require more than the format above, such as the delivery
   card's key in every subject; where the documentation and the history
   disagree, the documentation wins. A convention missed here is found
   after every commit has been written, and correcting it means rewording
   them all.

4. **Commit rules**:
   - Keep the subject line to one line. Add a body when the change needs
     context the subject cannot carry — why the change was made, a trade-off
     taken, or a consequence for other work. Separate it from the subject with
     a blank line, and leave it out when the subject already says everything.
   - Never include trailers, co-author lines, AI/tool attribution,
     generated-by markers, bot signatures, or metadata implying AI involvement
     — in the subject or the body.
   - Use `git add` for specific files per commit, never `git add .` unless all changes belong to one commit.
   - **Read `git diff --cached --name-only` immediately before every commit,
     and commit only when it matches the group.** Naming your own files does not
     make the index yours: `git rm`, `git mv` and an interrupted earlier group
     all stage changes that stay staged, so a later `git add <one file>` commits
     them alongside it. The result is a commit that spans two changes, and the
     message describes only one of them — which is invisible in review, because
     the message reads as true.
   - After each commit, run `git log -1 --format=%B` and verify the final message contains no AI-related attribution or metadata, then run `git status` to verify success.
   - **A file that mixes this change's edits with someone else's unrelated
     uncommitted work needs hunk-level staging, not a decision to include
     or skip the whole file.** `git add <file>` stages every hunk in it,
     which either drags unrelated work into your commit or forces you to
     leave your own change unstaged. Isolate your hunks first —
     `git diff -- <file>` and identify them by their `@@` headers — then
     stage only those with `git apply --cached` against a patch file
     containing just those hunks (each hunk needs the same `diff --git`
     header, but its own `@@` block; git apply locates it by context, so
     drift in the stated line numbers from omitted hunks is not a
     problem). Verify the split with `git diff --cached -- <file>` (only
     your hunks) and `git diff -- <file>` (only the rest, still present in
     the working tree, untouched). This is a real, not hypothetical, shape
     in a repository with one large shared test file that every change in
     an area lands in.

5. **Execution order**: Stage and commit one group at a time. Do not skip ahead.
