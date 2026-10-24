## Code Style

### Linting, Formatting and Static Analysis

Ensure code consistency by adhering to the project's configured tools, whatever the language.

- Find the tools for every language the change touches, in each sub-project, not only the root. Read each one's manifests and their scripts (`package.json`, `composer.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`…) and its tool config files (e.g. `biome.json`, `eslint.config.*`, `.prettierrc*`, `.php-cs-fixer*.php`, `phpstan.neon`, `phpcs.xml`, `ruff.toml`, `mypy.ini`, `.golangci.yml`, `rustfmt.toml`, `.shellcheckrc`, `.markdownlint*`, `.yamllint*`), plus `.editorconfig`.
- Prefer the project's own entry point over calling tools directly: a `Makefile` or `justfile` target (e.g. `make lint`), a package or Composer script, a command documented in the README or contributing guide, or the lint job in CI. Run it on the changed files when it accepts them.
- When there is no entry point, run the configured tools with the project's config, as CI does.
- Follow each tool's rules and the conventions of the surrounding code. When several tools cover one concern, let each handle its own (e.g. Prettier formats while ESLint checks logic; php-cs-fixer formats while PHPStan checks types).
- Never introduce a new tool, configuration or style the project does not already use, unless the user asks for it.
- If a language has no configured tool, match the existing code and `.editorconfig`, and use the language's standard formatter only where it is the norm (e.g. `gofmt`, `rustfmt`).
