# Boundary Desktop CHANGELOG

Canonical reference for changes, improvements, and bugfixes for Boundary Desktop.


## Next

### New & Improved

- Scrolling now occurs within columns individually so that sidebar and header remain visible when scrolling the application body.  ([PR](https://github.com/hashicorp/boundary-ui/pull/482))

### Changes/Deprecations

- Boundary Desktop is now simply "Boundary".  This change affects macOS asset filenames, as well as the title used within the application.  Documentation will continue to refer to "Boundary Desktop" to avoid confusion with the core binary.  ([PR](https://github.com/hashicorp/boundary-ui/pull/481))
- Boundary origin validation now occurs via Electron's built-in net request module, ensuring the validation request is made via chromium's networking library rather than Node's.  ([PR](https://github.com/hashicorp/boundary-ui/pull/480))

## v1.0.0-alpha (2021.02.16)

v1.0.0-alpha is the first release of Boundary Desktop. As a result there are no changes, improvements, or bugfixes from past versions.
