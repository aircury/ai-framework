# Add an optional shared UI design system capability


## Context

Several Aircury products that install the framework (`boards`, `tasks`, `link-go`) are meant to share one visual identity while keeping room for product branding.

The `frontend` capability deliberately treats each project's existing design system as the source of truth. It extracts `specs/ui/style-guide.md` from the project code and never prescribes a component library. That keeps single projects consistent, but it gives products no shared source to converge on:

- `boards` and `tasks` already run Next.js, React 19, Tailwind CSS v4, and Base UI, and both use the shadcn/ui semantic token names (`--primary`, `--muted`, `--card`, and so on). The `tasks` style guide was copied by hand from a pinned `boards` commit, and the two token sets have already drifted (`--coral` exists only in `tasks`; `--secondary`, `--info`, and `--automation` exist only in `boards`).
- `link-go` uses plain CSS with its own token vocabulary (`--color-brand`, `--color-panel`) and no component library.
- `link-ai` and `linky` each keep a shadcn/ui monorepo package (`packages/ui`, both named `@link-ai/ui`) on Radix. The two packages are identical copies, so sharing stops at the repository boundary.
- The external `aircury/walking-skeleton` skill ships `ADR-0501: Adopt shadcn/ui as the Frontend Design System` for new projects. It does not say where shared components come from, so each new project starts from the generic shadcn/ui defaults.

The options considered were:

- shadcn/ui on Base UI, distributed through a private Aircury registry. shadcn/ui made Base UI its default foundation in July 2026, and its CLI v4 can ship a whole design system (components, dependencies, CSS variables, fonts, and configuration) as a `registry:base` item. Components are copied into each project, and `shadcn add --diff` shows upstream changes before they are applied.
- A compiled `@aircury/ui` npm package. Upgrades would be automatic, but projects could not adapt component source, and the package would need a release pipeline and a dedicated owner.
- A fully styled library such as HeroUI, Mantine, or MUI. These are strongly opinionated, but adopting one would mean migrating existing Base UI work, and products would look like the library rather than like Aircury.
- A shared token contract without components. This is the cheapest option, but components would keep drifting.

## Decision

Aircury will add an optional `shared-ui` capability, selected per project and not enabled by default.

The capability standardises on:

- shadcn/ui components built on Base UI, styled with Tailwind CSS v4.
- A private shadcn registry under the `@aircury` namespace. Its source is the private [aircury/ui](https://github.com/aircury/ui) repository, not this framework. The built registry files in `public/r/` are served straight from GitHub at `https://raw.githubusercontent.com/aircury/ui/main/public/r`, authenticated with a GitHub token that can read the repository. Projects configure the registry in `components.json` through the `AIRCURY_UI_REGISTRY_URL` and `AIRCURY_UI_REGISTRY_TOKEN` environment variables, so the hosting can move later without changing project files.
- The Aircury brand file, adapted to shadcn/ui token names, as `DESIGN.md` in `aircury/ui`. It is the source of truth for the registry, and `@aircury/base` installs a copy at `specs/ui/DESIGN.md` in each product so agents read the same brand rules everywhere.
- A two-layer theme. The `@aircury/base` registry item owns the semantic token names and the brand values for light and dark mode. Each product overrides values in its own stylesheet, loaded after the stylesheet that the shadcn CLI manages, and must not rename, remove, or bypass the shared token names.
- `specs/ui/shared-ui.md` as the per-project record of the registry configuration, the installed registry items, and the product theme overrides. `specs/ui/style-guide.md` keeps describing the project's full visual language and marks which parts come from the registry.

The `frontend` capability stays unchanged for projects that do not select `shared-ui`.

## Consequences

- Existing installations generate the same `FRAMEWORK.md`, `AGENTS.md`, and capability files as before, because `shared-ui` is opt-in.
- Projects that select `shared-ui` look in the `@aircury` registry before creating a shared primitive, and they pull upstream changes deliberately with `shadcn add --diff`.
- Product branding stays possible through value overrides, while token names and primitives converge across products.
- The registry is maintained outside this framework. It starts with `@aircury/base`, the brand fonts, `@aircury/button`, and `@aircury/badge`; further primitives are built to `DESIGN.md` as products need them.
- Products that adopt `@aircury/base` switch to the Aircury brand palette (deep blue primary, warm stone neutrals) unless they override values in their product theme stylesheet.
- `link-go` needs Tailwind CSS v4 and a token rename before it can adopt the capability. `boards` and `tasks` need little change beyond consuming registry items.
- `link-ai` and `linky` need a Radix to Base UI migration before they can adopt the capability. The migration can run one component at a time with the shadcn migration skill.
- `ADR-0501` in `aircury/walking-skeleton` should point new projects at the `@aircury` registry, so greenfield projects start from the shared design system.
- Registry changes must commit the rebuilt `public/r/` files, because GitHub serves those files directly. The `aircury/ui` CI checks that they are up to date.
- Adding a UI dependency outside the registry still requires an ADR in the consuming project, as the `frontend` capability already requires.
