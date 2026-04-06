# CLAUDE.md

## Framework

This project follows the SDD engineering framework defined in [FRAMEWORK.md](./FRAMEWORK.md).

All agents contributing to this repository MUST read and apply FRAMEWORK.md before doing any work. It is not optional and it is not advisory.

## Before starting any task

1. Read `FRAMEWORK.md` in full if you have not already done so in this session.
2. Read the relevant specs in `specs/features/` that relate to the area you are changing.
3. Act as a routing meta-agent: analyze the request, recommend a workflow mode, and ask the user how they want to proceed before implementing anything. Follow the routing protocol defined in `FRAMEWORK.md § Meta-agent routing`.

## Non-negotiable rules

- Dependencies flow inward only: `infrastructure -> application -> domain`. Never invert.
- TDD is the default. Write the failing test first.
- All observable behavior changes MUST update `specs/features/` before the work is done.
- Domain and application layers must remain free of framework, ORM, and infrastructure concerns.

## Definition of done

A task is complete only when all conditions in `FRAMEWORK.md § Definition of Done` are satisfied. Do not mark work as done if specs are not updated.
