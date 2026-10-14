---
name: supervised-db-debugging
description: >-
  Diagnose missing or incorrect database data by running hypothesis queries
  yourself through Proxy Diablo, a local proxy where a human approves every
  query and releases the result. Installs Proxy Diablo from this skill folder
  on first use. Use when debugging missing or wrong rows, 500 errors traced to
  queries, or data integrity problems on a PostgreSQL database you can reach
  but should not touch unsupervised. Prefer blind-db-debugging when Proxy
  Diablo cannot be installed.
---

# Supervised DB Debugging

Same method as `blind-db-debugging` (code-grounded hypotheses, PASS/FAIL expectations, no fix before a confirmation), but you run the queries. Each one goes through Proxy Diablo: a human approves it in a local browser UI and releases the output, so you only ever see what they let through.

`SKILL_DIR` below is the folder containing this `SKILL.md`. Everything generated lives in `$SKILL_DIR/.runtime/` and is safe to delete.

## Phase A -- Make sure the tool works

1. Run `make -C "$SKILL_DIR" doctor`.
2. If the build is missing, tell the user it will clone and build Proxy Diablo (about a minute, needs Node 20.19+ or 22.12+, git and network), then run `make -C "$SKILL_DIR" install`.
3. If no environment exists for the database in question, ask the user for host, port, database, user and where the password comes from. **Never ask for the password itself in chat.** Then:

```bash
make -C "$SKILL_DIR" env-add NAME=<name> HOST=<host> DBUSER=<user> PORT=<port> DB=<database> [PASSWORD_ENV=<VAR>] [SSLMODE=require]
```

   With no `PASSWORD_ENV` the UI asks the human for the password the first time it is needed. Opening any tunnel (SSM, bastion) is the user's job; the host in the environment is whatever address they reach the database on.
4. Tell the user to open the approval UI (`make -C "$SKILL_DIR" ui`, then http://localhost:17871) and keep it visible. Nothing runs until they approve.

Call the CLI only through the wrapper, which sets all paths: `"$SKILL_DIR/scripts/diablo" ...`. It does not need to be on `PATH`.

## Phase 0 -- Gather context

Before writing any query:

1. **Expected output** -- what the user sees or should see, at product level.
2. **Trace the code** -- follow the path from the UI or API response down to the query: view, controller or resolver, service, query. Identify the joins and filters that produce the output.
3. **Ask only what the code cannot answer**: scope (one record, a subset, all), when it started, and optionally one working example key for a control group.
4. **Learn the structure, not the data** (metadata can be read directly, no approval needed):

```bash
"$SKILL_DIR/scripts/diablo" pgsql inspect "<environment>" "<database>" --tables --schema public
"$SKILL_DIR/scripts/diablo" pgsql inspect "<environment>" "<database>" --columns --schema public
```

Do not skip this phase. Hypotheses must come from the real code path and real schema.

## Phase 1 -- Hypotheses

Write 3-5 falsifiable hypotheses (A, B, C...), each plausible given Phase 0. No generic checklists.

## Phase 2 -- Run the queries

Submit one query per hypothesis, in order of how cheaply each one can be ruled out. Every submission blocks until the human decides:

```bash
"$SKILL_DIR/scripts/diablo" pgsql submit "<environment>" "<database>" \
  --classification read \
  --description "HYPOTHESIS A: orders for tenant 42 lose their status after import. PASS: 0 rows. FAIL: rows with NULL status." \
  --sql "select id, status from public.orders where tenant_id = 42 and status is null limit 20;"
```

- State the hypothesis and the PASS/FAIL expectation in `--description`; the reviewer reads it.
- Add a sibling control query against a known-working record when one exists. If the control also fails, the query logic is wrong, not the data.
- Prefer narrow selects (key columns, counts via `select count(*) as n`, `limit 20` on large tables) so there is less to release.
- Classify honestly: `read` only if it changes nothing. SQL that is a write or ambiguous needs two approvals regardless.

## Phase 3 -- Evaluate each result

| Outcome | Meaning |
|---------|---------|
| **CONFIRMED** | The result shows the broken state and the control (if any) is healthy. |
| **REJECTED** | The result matches a healthy state. Rule it out. |
| **INCONCLUSIVE** | Ambiguous. Narrow the query (drop one condition at a time) to find which one filters the rows. Do not propose a fix. |

Handle the proxy's replies:

- `released` -- use only that output. Mention `filteredColumns`; treat placeholders as final and never try to reconstruct them.
- `revision_requested` -- follow the explanation, narrow the query, reclassify, resubmit. Never broaden scope.
- `cancelled` -- stop; do not resubmit.
- `error` -- explain it. For connection errors say whether the tunnel or the password is the likely cause. Never look for output outside the proxy.

## Phase 4 -- Fix and verify

- Never propose a fix until a hypothesis is CONFIRMED.
- Apply the fix in code. Run data-changing SQL only if the user asked for it, classified `write` (two approvals).
- Verify with the same queries; the fix is proven only when they return the healthy result.

## Phase 5 -- Iterate

If every hypothesis is REJECTED, go one layer deeper and generate a new batch:

```
source / seed data
    -> config / lookup tables
        -> mapping / translation tables
            -> join / membership tables
                -> aggregated / denormalized tables
                    -> application-level read (ORM, cache, API filter)
```

## Secrets and sensitive data

- Never put a secret in SQL, a description or CLI arguments, and never read `.runtime/environments.json` values aloud beyond names and hosts.
- Do not add redirections, `tee` or verbose flags that could expose output before release.
- If released output looks like a credential, token or personal data, warn the user at once without repeating the value, and recommend rotation.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Proxy Diablo is not installed` | `make -C "$SKILL_DIR" install` |
| `server: could not start` | Read `$SKILL_DIR/.runtime/config/proxydiablo/server.log`; check Node version |
| Password prompt in the UI | Expected when no `PASSWORD_ENV` is set; the human types it, kept in memory only |
| Connection refused / timeout | The user's tunnel or network is down |
| Update Proxy Diablo | `make -C "$SKILL_DIR" update` (the pinned ref lives at the top of the Makefile) |
