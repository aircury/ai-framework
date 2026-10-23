---
name: blind-db-debugging
description: >-
  Diagnose database issues via SQL row counts without seeing actual data values.
  Use when debugging missing or incorrect database data, 500 errors traced to
  queries, or data integrity issues where the user runs SQL and reports only row
  counts back.
---

# Blind DB Debugging

## Overview

Diagnose database issues (missing or incorrect data) via SQL row counts without ever seeing actual data values. The agent generates hypotheses and queries; the user runs them and reports only row counts back.

## Phase 0 -- Gather Context

Before writing any query:

1. **Understand the expected output** -- what the user sees (or should see) in the final app or product. Describe it at the product level, not the database level.
2. **Trace back through the code** -- follow the call chain from the UI or API response back to the database: view -> controller/resolver -> service -> query. Identify which queries, joins, or filters are responsible for producing that output.
3. **Ask only what the code cannot answer**:
   - Scope -- one record, a subset, or all records?
   - When it started -- after a deploy, migration, data import, or unknown?
   - A working example *(optional)* -- one ID or key that behaves correctly; enables control group queries.

Do not skip this phase. Hypotheses must be grounded in the actual code path, not guesses about the schema.

## Phase 1 -- Generate Hypotheses

Produce 3-5 hypotheses derived strictly from the context provided. Each hypothesis must be a falsifiable claim about why the data is wrong or missing -- grounded in what is known about the schema, the recent changes, and the scope of the problem. Label them A, B, C...

Do not use a generic checklist. Every hypothesis must earn its place by being plausible given the specific context gathered in Phase 0.

## Phase 2 -- Write Queries

Deliver all queries in **one copy-paste block**. Each query must follow this format:

```sql
-- HYPOTHESIS A: <one-line description of what could be wrong>
-- PASS: N rows (what a good result looks like)
-- FAIL: 0 rows (what a bad result looks like)
SELECT meaningful, columns
FROM ...
WHERE ...
LIMIT 20;
```

**Control group (optional):** If a working example was provided, add a sibling query per hypothesis running the same filter against the known-working record. If the working record also returns 0 rows, the issue is in the query logic, not the data.

```sql
-- HYPOTHESIS A (broken): ...
SELECT id, status FROM orders WHERE id = :broken_id AND status = 'active' LIMIT 5;

-- HYPOTHESIS A (control): same filter on known-working record
SELECT id, status FROM orders WHERE id = :working_id AND status = 'active' LIMIT 5;
```

## Phase 3 -- Evaluate

The user reports only row counts. Evaluate each hypothesis:

| Result | Meaning |
|--------|---------|
| **CONFIRMED** | Broken = 0 rows (and control = N rows if available). This is the cause. |
| **REJECTED** | Count matches what a healthy state would look like. Rule this out. |
| **INCONCLUSIVE** | Counts are unexpected or ambiguous. Refine the query or move to the next layer. |

**On INCONCLUSIVE:** do not propose a fix. Instead, narrow the query (remove one WHERE clause at a time) to isolate which condition is filtering out the row.

## Phase 4 -- Fix and Verify

- **Never propose a fix** until at least one hypothesis is CONFIRMED.
- After applying the fix, deliver a **verification query block** using the same format.
- The fix is proven only when the verification block returns the expected row count.

## Phase 5 -- Iteration

If all hypotheses are REJECTED, move one layer deeper:

```
source / seed data
    -> config / lookup tables
        -> mapping / translation tables
            -> join / membership tables
                -> aggregated / denormalized tables
                    -> application-level read (ORM, cache, API filter)
```

Generate a new batch of hypotheses from the next layer. Repeat until CONFIRMED or the full stack is exhausted.

## Rules

- **Never use `COUNT(*)`** -- it always returns 1 row; use a filtered `SELECT` instead.
- **Never use `SELECT 1`** -- use meaningful columns so the user can validate the data.
- **Add `LIMIT` when the WHERE is not selective** -- if the query filters by a specific ID or a small known set, LIMIT is unnecessary. If the query touches potentially large tables (events, logs, status records) without a tight filter, add `LIMIT 20`. If uncertain, add it with a note: `-- NOTE: remove LIMIT if the WHERE clause is already selective enough`.
- **Use a control group when available** -- run the same filter against a known-working record to distinguish data issues from query logic issues.
- **One block per round** -- deliver all queries together so the user runs them in one pass.
- **Never assume data is correct** -- verify every link in the chain independently.
