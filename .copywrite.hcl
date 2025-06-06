schema_version = 1

project {
  license        = "BUSL-1.1"
  copyright_year = 2024

  # (OPTIONAL) A list of globs that should not have copyright/license headers.
  # Supports doublestar glob patterns for more flexibility in defining which
  # files or folders should be ignored
  header_ignore = [
    ".github/**",
    ".husky/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "ui/desktop/electron-app/out/**",
    "ui/desktop/electron-app/ember-dist/**",
    "**/pnpm-lock.yaml",
    "**/pnpm-workspace.yaml",
  ]
}
