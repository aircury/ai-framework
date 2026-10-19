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

## Stage 1 -- Identify the database first

Before installing, starting the server or writing any query, settle **which database** the problem happens in and **which environment** reaches it. Nothing here needs the server.

1. **Pin down where it happens** from the ticket or the user's words: production, staging, a preview, a client instance, or local. If the user said it, that wins.
2. **Read what the project already says**, without touching secrets:
   - `README*`, `docs/`, `CLAUDE.md`/`AGENTS.md`, the llm-wiki if there is one, `docker-compose*.yml`, deploy/infra config, and app config that names hosts or database names (e.g. `config/packages/doctrine.yaml`, `database.yml`, `settings.py`).
   - Never open `.env` files or anything holding credentials; a variable *name* such as `DATABASE_URL` is enough to know where to ask.
3. **Check existing environments**: `make -C "$SKILL_DIR" env-list` (reads the file only). Propose one only if it is clearly the same target: same host *and* database, or a name that unambiguously matches the place from step 1. Names imported from PhpStorm may carry a guessed user; say so.
4. **Confirm with the user** before going further, in one message: the environment you intend to use (or the one you need to create), host, database and user, and that a production target means every query is read-only unless they ask otherwise. If nothing matched, ask for host, port, database and user, and how the password is provided -- never the password itself.

Only when the user has confirmed the target, continue.

## Phase A -- Make sure the tool works

1. Run `make -C "$SKILL_DIR" doctor` (this starts the local server).
2. If the build is missing, tell the user it will clone and build Proxy Diablo (about a minute, needs Node 20.19+ or 22.12+, git and network), then run `make -C "$SKILL_DIR" install`.
3. If Stage 1 ended without an existing environment, create the confirmed one. **Never ask for the password itself in chat.**
   - **From PhpStorm** (preferred when the project has data sources): `make -C "$SKILL_DIR" env-import-phpstorm PROJECT=<project dir>`. It reads `.idea/dataSources.xml` and the user names from `dataSources.local.xml`, never PhpStorm's stored passwords, and names entries `<project>/<data source>`. Windows paths such as `C:\Users\me\proj` are converted to `/mnt/c/...`. Add `DBUSER=<user>` for sources without a stored user. The password is asked for in the UI when first needed.
   - **By hand**: ask for host, port, database, user and where the password comes from, then:

```bash
make -C "$SKILL_DIR" env-add NAME=<name> HOST=<host> DBUSER=<user> PORT=<port> DB=<database> [PASSWORD_ENV=<VAR>] [SSLMODE=require]
```

   - **AWS IAM databases** (no password at all): `make -C "$SKILL_DIR" env-add NAME=<name> HOST=<rds host> DBUSER=<iam user> DB=<database> AUTH=rds-iam AWSPROFILE=<aws profile>` (add `REGION=` if the host is not an RDS hostname, e.g. a tunnel to localhost). Tokens are minted per connection with the `aws` CLI inside the WSL/Linux environment where this skill runs, so that environment needs AWS CLI v2 and an `~/.aws/config` with the developer profile (see the `aircury-aws-sso` skill). If the error says to run `aws sso login --profile X`, ask the user to run it, then retry. IAM access is read-only by default.

   With no `PASSWORD_ENV` the UI asks the human for the password the first time it is needed. Opening any tunnel (SSM, bastion, PhpStorm SSH tunnel) is the user's job; the host in the environment is whatever address the *Linux side* reaches the database on. A `localhost` host imported from PhpStorm only works from WSL if that port is forwarded there.
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

Submit one query per hypothesis, in order of how cheaply each one can be ruled out. Every submission blocks until the human decides, which can take many minutes: never wrap it in a short `timeout`, and run it in the background if your tool has a time limit. If the submitting process dies, its tab is cancelled and the result cannot reach you:

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
- `cancelled` -- stop; do not resubmit. Exception: if the tab says the requester disconnected (your own CLI call was interrupted), resubmit the same query once and tell the user.
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
| Connection refused / timeout | The user's tunnel or network is down, or an imported `localhost` port is not forwarded into WSL |
| `aws sso login` message | Ask the user to run the command it names, then retry |
| A new environment is missing from the UI list | The list refreshes within a second of `env-add`; reload the page if it still is not there |
| Update Proxy Diablo | `make -C "$SKILL_DIR" update` (the pinned ref lives at the top of the Makefile) |
