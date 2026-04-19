---
name: airsync
description: Collaborative memory system for AI agents and teams. Three-layer architecture (INBOX → PUBLISHED → ARCHIVED) ensures only high-quality knowledge reaches the shared team memory.
---

# Airsync Memory Workflow

## Purpose

Airsync is a **managed memory system** where AI agents and human developers collaboratively build a shared knowledge base. Unlike traditional knowledge bases where everything is searchable immediately, Airsync uses a **gated lifecycle** to prevent low-quality content from contaminating team-wide search.

### The Three Layers

| Layer | Visibility | TTL | Purpose |
|-------|-----------|-----|---------|
| **INBOX** | Explicit only | 14 days | Raw captures awaiting review |
| **PUBLISHED** | Default search | Permanent | Vetted, high-quality knowledge |
| **ARCHIVED** | Explicit only | Permanent | Retired or obsolete content |

**Key Principle**: Writing to the knowledge base ≠ Making it searchable.

---

## Required Workflow

### 1. Retrieve Context First

Before making architectural decisions or implementing changes:

```
memory_search(
    query="your search terms",
    memory_kind="best_practice",  # optional filter
    tags_any=["relevant", "tags"]   # optional filter
)
```

- Default search only returns **PUBLISHED** memories
- Use `layers=["PUBLISHED", "ARCHIVED"]` to include archived content
- Use `layers=["INBOX"]` only when explicitly reviewing pending memories

### 2. Produce Output With Traceability

- Cite memory IDs for major decisions: "Based on mem_01hz3kp8x2a5mv7b..."
- If memories conflict, prefer higher quality scores and newer timestamps
- Note when you're overriding documented best practices

### 3. Capture Learnings (INBOX)

When you discover something worth remembering:

```
memory_propose(
    entry={
        "memory_kind": "best_practice",  # or "learning", "observation", "note", "model"
        "scope": "team",                 # or "project", "agent"
        "author_agent_id": "your-agent-id",
        "title": "Clear outcome-focused title",
        "content": "Detailed explanation with context...",
        "tags": ["architecture", "patterns"],
    }
)
```

**Important**: All proposals go to **INBOX**, not directly to PUBLISHED. They won't appear in default searches until promoted.

### 4. Quality Self-Check Before Proposing

The quality score (0.0-1.0) is computed automatically:

| Criterion | Points |
|-----------|--------|
| Title > 10 chars | +0.20 |
| Content > 50 chars | +0.20 |
| Has memory_kind | +0.15 |
| Scope = project/team | +0.15 |
| ≥2 tags | +0.15 |
| Content > 200 chars | +0.15 |

**Minimum 0.5 required for promotion**. Improve your entry if quality is low.

---

## Memory Kinds

| Kind | Use For | Example |
|------|---------|---------|
| `best_practice` | Validated approaches that work | "Use hexagonal architecture for framework modules" |
| `learning` | Insights from experience | "Discovered that batching reduces API calls by 80%" |
| `observation` | Noted patterns without full validation | "Seems like Qdrant queries are faster with pre-filtering" |
| `note` | General documentation | "API rate limits are 1000 req/min" |
| `model` | Mental models or frameworks | "The CAP tradeoff in distributed systems" |

---

## Tool Reference

### Write Operations

```
memory_propose(entry, team_id?) → MemoryRecord
    Creates a new memory in INBOX. Performs exact deduplication check.
    Returns error if exact duplicate exists in team.

memory_promote(memory_id, team_id?) → PromoteResult
    Moves INBOX memory to PUBLISHED. Requirements:
    - Quality >= 0.5
    - No semantic duplicates (>0.95 similarity) in PUBLISHED
    Returns duplicate_of if similar memory exists.

memory_archive(memory_id, reason, team_id?) → MemoryRecord
    Archives a memory (from any layer). Reasons:
    - "superseded" - replaced by newer content
    - "obsolete" - no longer relevant
    - "incorrect" - contains errors
    - "consolidated" - merged into another memory
    - "expired" - TTL expired (usually automatic)
```

### Read Operations

```
memory_search(query, top_k?, team_id?, layers?, memory_kind?, scope?, tags_any?) → [SearchResult]
    Semantic search with layer-aware filtering.
    Default: only searches PUBLISHED.
    Automatically excludes expired INBOX entries.

memory_get(memory_id, team_id?) → MemoryRecord
    Retrieves any memory by ID (any layer).

memory_list_inbox(team_id?) → [MemoryRecord]
    Lists pending INBOX memories for review.
    Sorted by created_at desc (newest first).

memory_find_duplicates(memory_id, team_id?, threshold?) → DuplicateCheckResult
    Finds exact and semantic duplicates.
    Useful before promotion.
```

---

## Content Quality Guidelines

### DO Capture

- Root cause + fix patterns applicable beyond this task
- Architectural decisions with clear rationale
- Validated runbooks and operational commands
- Repeated pitfalls and how to avoid them
- Team-wide conventions and standards
- Mental models that explain complex systems

### DO NOT Capture

- Project-specific implementation details other teams can't reuse
- Debugging sessions without transferable lessons
- Scratch notes or in-progress findings
- Content already in codebase, docs, or prior memory
- Transient observations without context

### The Collaboration Test

Before proposing, ask: **"Would a developer on a different project benefit from this in 3 months?"**

If no → don't propose.

---

## Deduplication

The system prevents duplication at two levels:

### 1. Exact Duplication (propose phase)
- SHA-256 hash of normalised content
- Rejects identical content within same team
- Returns existing memory ID on conflict

### 2. Semantic Duplication (promote phase)
- Vector similarity > 0.95 threshold
- Checked against PUBLISHED layer only
- Suggests merge instead of promotion

**Best Practice**: Search before proposing. If similar content exists, enhance it rather than creating a duplicate.

---

## Example Workflows

### Adding a New Best Practice

```python
# 1. Check if it already exists
results = memory_search(
    query="hexagonal architecture framework modules",
    memory_kind="best_practice"
)

# 2. If not found, propose to INBOX
memory = memory_propose(entry={
    "memory_kind": "best_practice",
    "scope": "team",
    "author_agent_id": "claude-opus-4",
    "title": "Use hexagonal architecture for framework modules",
    "content": "All framework modules must follow hexagonal architecture...",
    "tags": ["architecture", "hexagonal", "framework"],
})

# 3. When confident, promote to PUBLISHED
memory_promote(memory_id=memory.id)
```

### Reviewing Pending Memories

```python
# List INBOX for review
inbox = memory_list_inbox(team_id="my-team")

for memory in inbox:
    if memory.quality >= 0.5:
        # Check for duplicates first
        dups = memory_find_duplicates(memory.id)
        if not dups.semantic_duplicates:
            memory_promote(memory.id)
        else:
            print(f"Merge candidate: similar to {dups.semantic_duplicates[0].memory.id}")
    else:
        print(f"Low quality ({memory.quality}), needs improvement")
```

---

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `AIRSYNC_TEAM_ID` | "default" | Default team for all operations |
| `AIRSYNC_INBOX_TTL_DAYS` | 14 | Days before INBOX expires |
| `AIRSYNC_DEDUP_THRESHOLD` | 0.95 | Semantic similarity threshold |
| `AIRSYNC_MIN_QUALITY_FOR_PUBLISH` | 0.5 | Minimum quality for promotion |
| `AIRSYNC_DEFAULT_SEARCH_LAYERS` | "PUBLISHED" | Default layers for search |

---

## Safety Rules

1. **Never store secrets** - No credentials, tokens, or personal data
2. **Never fabricate** - Don't invent prior knowledge when search returns nothing
3. **Cite your sources** - Use source_refs for traceability
4. **Prefer promotion over direct publish** - All entries should pass through INBOX
5. **Archive obsolete content** - Don't let outdated knowledge pollute search
