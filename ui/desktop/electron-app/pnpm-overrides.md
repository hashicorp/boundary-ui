# package.json Overrides

This file documents the rationale for each dependency override defined in `package.json` under `pnpm.overrides` for the `electron-app` sub-package.
These overrides force specific versions of transitive dependencies, primarily for security and compatibility reasons.

| Package | Version | Pulled in by | What to check before removing |
|---------|---------|--------------|-------------------------------|
| `tar` | `^7.5.10` | Both `cacache` (`^16.1.3`) and `@electron/rebuild` (`^6.0.5`) pin old ranges. | Check whether newer releases of `@electron/rebuild` and `cacache` (brought in via `@electron-forge` and `electron`) allow `tar ^7.x`. |
| `yauzl` | `^3.3.1` | `extract-zip` depends on `yauzl@^2.10.0`. `extract-zip` is used directly by both `electron` and `@electron/packager`. `yauzl@2` is broken on Node 24.16+ (see [electron/electron#51619](https://github.com/electron/electron/issues/51619)). | Remove once both `electron` and `@electron/packager` drop their dependency on `extract-zip`. |
| `external-editor>tmp` | `^0.2.7` | `external-editor` (`^3.1.0`) depends on `tmp@0.0.33`. `@inquirer/editor@3.0.1` uses `external-editor` but dependency is removed in newer versions. | Remove once `@electron-forge/cli` upgrades to use `@inquirer/prompts ^8.5.2` since this version fixes security warnings in `@inquirer/external-editor` and no longer has a downstream dependency on `external-editor`. |

