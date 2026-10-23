# DB Schema Decision Record

## Context

What product/domain problem are we solving?
Graduated
## Existing model

What tables/entities already exist?

What project conventions matter?

- Naming:
- ID strategy:
- Audit columns:
- Soft delete / hiding:
- Enum vs lookup-table style:
- Index style:

## Options considered

### Option A

Summary:

Benefits:

Costs:

Migration cost:

### Option B

Summary:

Benefits:

Costs:

Migration cost:

## Product Owner question

What question decides the trade-off?

## Decision

Chosen option:

Why:

## Naming decision

Chosen table/entity names:

Why these names fit the domain:

Many-to-many tables, if any:

## Indexes and constraints

Primary keys:

Foreign keys:

Unique constraints:

Check constraints:

Indexes:

## Audit decision

Existing project convention:

Audit fields added:

Reason:

## Migration notes

Backfill:

Rollback:

Data cleanup:

Risk:

## Existing-model pragmatism

High-impact changes worth doing:

Minor issues not worth migrating for now:

## Skill deviations

None, or list confirmed deviations.