# Support external design systems through a file contract


## Context

Several products that install the framework are meant to share one visual identity while keeping room for product branding. The `frontend` capability treats each project's own code as the design-system source: it extracts `specs/ui/style-guide.md` from the project and never prescribes a component library. That keeps single projects consistent, but products have no shared source to converge on:

- `boards` and `tasks` run Next.js, React 19, Tailwind CSS v4, and Base UI with the shadcn/ui token names, and `tasks` copied its style guide by hand from a pinned `boards` commit. The two token sets have already drifted.
- `link-go` uses plain CSS with its own token vocabulary.
- `link-ai` and `linky` keep identical copies of a shadcn/ui package on Radix, so sharing stops at the repository boundary.

Aircury now has a shared design system in the private `aircury/ui` repository: a shadcn/ui registry on Base UI, with the brand rules in a `DESIGN.md` file.

A first version of this change added an opt-in `shared-ui` capability that wired the framework to that registry: its URL, its token, shadcn commands, and Aircury token names. Review rejected that coupling. The framework is a public, general package; hard-wiring one private library makes it opinionated about a choice that projects may make differently, and replacing the library later would mean changing the framework.

The options considered were:

- A dedicated capability for the Aircury library. Rejected for the coupling above.
- A generic design-system capability with configurable providers (`shadcn-registry`, `npm-package`, and so on). The framework would still encode how each kind of library is distributed, and it would need code for every provider.
- External provider plugins. Flexible, but it needs extension infrastructure for a single provider.
- A file contract: the framework defines which files an external design system delivers and how agents treat them, and each design system ships those files with its own content.

## Decision

The framework supports external design systems through a file contract in the `frontend` capability, without naming or configuring any library.

An external design system declares itself by delivering two files into the project:

- `specs/ui/DESIGN.md`: the brand and token rules.
- `specs/ui/design-system.md`: how to install, update, and override the library's components and tokens.

When they exist, agents read both before UI work, treat `DESIGN.md` as the source of truth for visual decisions (above conventions extracted from code), follow `design-system.md` for library usage, and do not edit either file in the project. `specs/ui/style-guide.md` keeps describing the full visual language and marks what comes from the design system. When they do not exist, the frontend capability behaves as before.

Everything specific to a library lives outside the framework:

- `aircury/ui` owns the Aircury registry, `DESIGN.md`, and `design-system.md`, and its base item installs both files.
- An optional `aircury-ui` skill in `aircury/shared-agent-skills` adopts the Aircury library in a project: registry setup, base install, product theme, and the adoption record.

## Consequences

- The framework stays library-agnostic. Another design system, such as a different registry or a themed npm package, works by shipping its own `DESIGN.md` and `design-system.md`.
- Projects without an external design system generate the same guidance as before, apart from the conditional contract text in the `frontend` rules.
- Adopting the Aircury library is opt-in per project, through the `aircury-ui` skill. Nothing in the installer changes.
- The daily usage rules of a library travel and version with the library, not with the framework.
- The framework cannot check that a project really uses the library described by the files; it relies on the files being present and current.
- Adopting, replacing, or removing an external design system is recorded in an ADR in the consuming project.
