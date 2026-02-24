schema_version = 1

project {
  license        = "BUSL-1.1"
  copyright_year = 2021

  # (OPTIONAL) A list of globs that should not have copyright/license headers.
  # Supports doublestar glob patterns for more flexibility in defining which
  # files or folders should be ignored
  header_ignore = [
    ".husky/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/pnpm-lock.yaml",
    "**/pnpm-workspace.yaml",
    "ui/desktop/electron-app/out/**",
    "ui/desktop/electron-app/ember-dist/**",
    "e2e-tests/api-client/**"
  ]
}
