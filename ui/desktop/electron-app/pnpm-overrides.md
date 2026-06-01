# package.json Overrides

This file documents the rationale for each dependency override defined in `package.json` under `pnpm.overrides` for the `electron-app` sub-package.
These overrides force specific versions of transitive dependencies, primarily for security and compatibility reasons.

| Package | Version | Pulled in by | What to check before removing |
|---------|---------|--------------|-------------------------------|
| `tar` | `^7.5.10` | Both `cacache` (`^6.1.11`) and `@electron/rebuild` (`^6.0.5`) pin old ranges. | Check whether newer releases of `@electron/rebuild` and `cacache` (brought in via `@electron-forge` and `electron`) allow `tar ^7.x`. |
| `yauzl` | `^3.3.1` | `extract-zip` depends on `yauzl@^2.10.0`. `extract-zip` is used directly by both `electron` and `@electron/packager`. `yauzl@2` is broken on Node 24.16+ (see [electron/electron#51619](https://github.com/electron/electron/issues/51619)). | Remove once both `electron` and `@electron/packager` drop their dependency on `extract-zip`. |

