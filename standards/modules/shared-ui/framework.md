## 1. Module Purpose

Activate this module when a project must share the Aircury visual identity with other Aircury products. The shared design system is shadcn/ui built on Base UI, styled with Tailwind CSS v4, and distributed through the private `@aircury` shadcn registry. The registry source is the `aircury/ui` repository; its README lists the available items.

This module extends the `frontend` capability. Keep following `frontend-ui-workflow` for layout, experience, style-guide, and implementation planning. The registry becomes the first source for shared primitives and design tokens.

`@aircury/base` installs the brand rules at `specs/ui/DESIGN.md`. Read it before any UI work: it defines the voice and copy rules, the colour roles, typography, spacing, radii, elevation, motion, iconography, and component behaviour. Treat it as registry-owned: do not edit it in the project; propose changes to `aircury/ui`.

## 2. Registry Configuration

Configure the registry in `components.json` under the `@aircury` namespace. Read the URL and token from the environment, and never commit either value:

```json
{
  "registries": {
    "@aircury": {
      "url": "${AIRCURY_UI_REGISTRY_URL}/{name}.json",
      "headers": {
        "Authorization": "Bearer ${AIRCURY_UI_REGISTRY_TOKEN}"
      }
    }
  }
}
```

- Set `AIRCURY_UI_REGISTRY_URL` to `https://raw.githubusercontent.com/aircury/ui/main/public/r` unless the project documents another host.
- Set `AIRCURY_UI_REGISTRY_TOKEN` to a GitHub token that can read `aircury/ui`, such as the output of `gh auth token` or a read-only fine-grained token. Keep it in the shell or in an uncommitted env file such as `.env.local`.
- A `requires the following environment variables` error from the shadcn CLI means a registry variable is not set. A `was not found` error for a known item usually means the token is invalid, expired, or cannot read `aircury/ui`, because GitHub answers 404 for private repositories. Ask the user to fix the variables or the token; do not work around the registry.
- Keep `components.json` on the Base UI foundation and Tailwind CSS v4. For a project without `components.json`, run `shadcn init -b base` first.
- Install the shared base once with `shadcn add @aircury/base`, and install shared primitives with `shadcn add @aircury/<name>`.
- Record the registry configuration, installed items, and product overrides in `specs/ui/shared-ui.md`.
- Document `AIRCURY_UI_REGISTRY_URL` and `AIRCURY_UI_REGISTRY_TOKEN` in the project's environment example file.

## 3. Token Contract

The shared base owns the token names. Products own token values.

The shared tokens use shadcn/ui names, each defined for light and dark mode. `specs/ui/DESIGN.md` lists every token and its role; the groups are:

- Surfaces and text: `background`, `foreground`, `card`, `popover`, `muted`, `muted-foreground`, `accent`, `border`, `input`, `ring`, and their `*-foreground` pairs.
- Actions: `primary`, `primary-hover`, `secondary`, `destructive`, `destructive-hover`, and `link` for any blue text.
- Status: `success`, `warning`, `info`, `destructive`, each with a `*-tint` background and a `*-tint-foreground` text colour that is AA-safe on that tint.
- Brand accents: `brand-green`, `brand-green-tint`, `brand-soft`. Never on buttons or as text.
- shadcn extras: `sidebar-*` and `chart-1` to `chart-5`.
- Shape, depth, and motion: `--radius` and the `rounded-*` scale capped at 16px, `shadow-card`, `shadow-modal`, and `ease-out`.

Rules:

- Expose every token to Tailwind through `@theme inline` as `--color-<token>: var(--<token>)`, so components use one set of utilities such as `bg-primary` and `text-muted-foreground`.
- Keep the stylesheet that the shadcn CLI manages (usually `globals.css`) as delivered by `@aircury/base`. Put product values in a separate product theme stylesheet, such as `theme.css`, that declares only `:root` and `.dark` overrides and is imported right after the managed stylesheet, so its values win.
- Override values only. Do not rename, remove, or alias a shared token.
- Add a product-only token only when no shared token fits. Declare it in the product theme layer, list it in `specs/ui/shared-ui.md`, and propose it to the registry once a second product needs it.
- Keep dark mode on the shared mechanism delivered by the base. Do not add a parallel theme switch.

## 4. Component Rules

- Search the `@aircury` registry before creating a shared primitive. Install and extend the registry item instead of writing a local equivalent.
- Treat registry components copied into the project as shared code. Keep product-specific changes small and list them in `specs/ui/shared-ui.md`.
- Prefer composition, variants, and wrapper components over editing the copied source. Edit the copied source only when composition cannot express the change.
- Pull registry updates deliberately with `shadcn add @aircury/<name> --diff`. Review the diff against the local changes recorded in `specs/ui/shared-ui.md` before applying it.
- When a local change would help other products, propose it to the registry repository instead of keeping a private fork.
- Build feature components from registry primitives. Feature components stay in the project and are not published to the registry.
- Add a UI dependency outside the registry, such as another component, icon, or animation library, only with explicit approval and an ADR.

## 5. Shared UI Record

`specs/ui/shared-ui.md` is project-owned. Create it when the module is first applied, and keep it current. It must contain:

- Registry: the namespace, the `components.json` entry, and the environment variables used.
- Installed items: each `@aircury` item, and the date or registry version of the last update.
- Theme overrides: each overridden token with its light and dark values.
- Product-only tokens: each token, its purpose, and whether it has been proposed to the registry.
- Local edits: each edited registry component, what changed, and why composition was not enough.
- Pending adoption: shared primitives or tokens not yet migrated, when the project is still converging.

Mark a section as `[none]` when it has no entries. Do not omit it.

## 6. Style Guide Integration

- Keep `specs/ui/style-guide.md` as the full description of the project's visual language.
- In each style-guide section, mark which tokens, primitives, and patterns come from the `@aircury` registry and which are product overrides or product-only additions.
- Do not copy the registry's documentation into the style guide. Link to the registry item names instead.

## 7. Quality Review Before Finish

Before finishing frontend work in a project with this module, verify:

- New shared primitives come from the `@aircury` registry, or `specs/ui/shared-ui.md` explains why none fits.
- No shared token was renamed, removed, or aliased, and every product-only token is listed in `specs/ui/shared-ui.md`.
- The change follows `specs/ui/DESIGN.md`: sentence case and concrete verbs in copy, no green or turquoise buttons, `text-link` for blue text, tint backgrounds paired with their `*-tint-foreground` text, Lucide icons, and spacing and radii on the scale.
- Product theme overrides live in the product theme stylesheet, not in the stylesheet that the shadcn CLI manages.
- Light and dark mode both render with the overridden values.
- Local edits to registry components are recorded in `specs/ui/shared-ui.md`.

## 8. Absolute Restrictions

- Do not commit registry URLs with embedded credentials or registry tokens.
- Do not fork a registry primitive into a differently named local component to avoid updates.
- Do not hardcode colours, radii, or spacing that a shared token already covers.
- Do not replace Base UI with another primitive library in a project that uses this module.
