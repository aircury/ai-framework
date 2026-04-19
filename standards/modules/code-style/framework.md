## Code Style

### Linting and Parsing


Ensure code consistency by adhering to the project's configured tools.

- Analyze `package.json` to identify the linter and parser used (e.g., Biome, ESLint, Prettier, Oxlint).
- Check `devDependencies` and `dependencies` for tool-specific packages.
- Locate configuration files (`.eslintrc.*`, `prettier.config.js`, `biome.json`, `oxlint.json`).
- If a tool is detected, follow its specific rules and formatting conventions.
- If multiple tools are present (e.g., ESLint and Prettier), prioritise the one that handles the relevant concern (e.g., Prettier for formatting, ESLint for logic).
- If no tool is explicitly configured, default to industry standards for the project's language (e.g., StandardJS or AirBnB for JS/TS).
