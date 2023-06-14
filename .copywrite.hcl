schema_version = 1

project {
  license        = "MPL-2.0"
  copyright_year = 2020

  # (OPTIONAL) A list of globs that should not have copyright/license headers.
  # Supports doublestar glob patterns for more flexibility in defining which
  # files or folders should be ignored
  header_ignore = [
    # "vendors/**",
    # "**autogen**",
    ".github/**",
    ".husky/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "addons/rose/.storybook/preview-head.html",
    "ui/desktop/electron-app/out/**",
    "ui/desktop/electron-app/ember-dist/**",
  ]
}
