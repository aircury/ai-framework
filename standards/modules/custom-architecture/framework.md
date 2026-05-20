## Custom Architecture Rules

Use this capability when the project should not be forced into DDD+Hexagonal, Clean Architecture, or Layered Architecture.

The active project architecture is documented in `FRAMEWORK.local.md` under `## Project Architecture`.

- The repository-specific architecture lives in `FRAMEWORK.local.md` under `## Project Architecture`.
- If that section is missing, run the `custom-architecture` skill before making architecture-sensitive changes.
- Follow the discovered package structure, dependency direction, naming conventions, and integration boundaries documented in `FRAMEWORK.local.md`.
- Do not impose a generic architecture style when the repository already uses a different coherent structure.
- When implementation changes materially alter architecture boundaries, update the `FRAMEWORK.local.md` architecture section in the same change.
- Keep generated framework files untouched; write project-specific discoveries only to `FRAMEWORK.local.md`.
