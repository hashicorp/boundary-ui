# Boundary Desktop CHANGELOG

Canonical reference for changes, improvements, and bugfixes for Boundary Desktop.

## v1.4.4 [CLI 0.9.0] (2022.06.20)

### New

- Use include_terminated flag for listing sessions ([PR](https://github.com/hashicorp/boundary-ui/pull/1126)) 
- Display auth method names in auth form ([PR](https://github.com/hashicorp/boundary-ui/pull/1113)) 

### Bug Fixes
-  Unavailable controller url should result in a friendlier error workflow  ([PR](https://github.com/hashicorp/boundary-ui/pull/1107))
-  fix target connection details overlay to show credential sources ([PR](https://github.com/hashicorp/boundary-ui/pull/1146))

## v1.4.3 [CLI 0.8.0] (2022.05.04)

### New

- Add manual refresh button in sessions list. ([PR](https://github.com/hashicorp/boundary-ui/pull/1069))
- Add manual refresh button in targets list. ([PR](https://github.com/hashicorp/boundary-ui/pull/1087))

### Bug Fixes

- Fix window lifecycle for Mac OS. ([PR](https://github.com/hashicorp/boundary-ui/pull/1067))

## v1.4.2 [CLI 0.7.6] (2022.03.16)

### New

- Support dynamic host catalogs. ([PR](https://github.com/hashicorp/boundary-ui/pull/981))

## v1.4.1 [CLI 0.7.3] (2021.12.16)

### New

- Add sessions filtering by project. ([PR](https://github.com/hashicorp/boundary-ui/pull/880))
- Add targets filtering by project. ([PR](https://github.com/hashicorp/boundary-ui/pull/883))

## v1.4.0 [CLI 0.7.1] (2021.11.18)

### New

- Sessions may now be filtered by status in the UI. ([PR](https://github.com/hashicorp/boundary-ui/pull/860))

## v1.3.0 [CLI 0.6.0] (2021.09.09)

### New

- Add Debian based linux support for client. ([PR](https://github.com/hashicorp/boundary-ui/pull/719))

## v1.2.1 [CLI 0.5.0] (2021.08.03)

### New

- Add secret toggle capability to connection details dialog. ([PR](https://github.com/hashicorp/boundary-ui/pull/637))

## v1.2.0 [CLI 0.4.0] (2021.06.29)

### New

- Add Vault credential support. ([PR](https://github.com/hashicorp/boundary-ui/pull/619))

## v1.1.0 [CLI 0.3.0] (2021.06.09)

### Known Issues

- When quitting Boundary Desktop on Windows, active sessions may not be properly cancelled prior to application shutdown.

### New

- Add Windows 10 support for client. ([PR](https://github.com/hashicorp/boundary-ui/pull/581))

### Bug Fixes

- Client will show update available prompt when a new version is released. ([PR](https://github.com/hashicorp/boundary-ui/pull/566))

## v1.0.1 [CLI 0.2.2] (2021.05.19)

### New

- Add prompt to close sessions when quitting client. ([PR](https://github.com/hashicorp/boundary-ui/pull/555))

### Bug Fixes

- Close spawned boundary process on session cancel. ([PR](https://github.com/hashicorp/boundary-ui/pull/549))

## v1.0.0 [CLI 0.2.0] (2021.04.14)

### New

- OIDC authentication support. ([PR](https://github.com/hashicorp/boundary-ui/pull/429))
- Check for client updates and update on-demand using new menu option. ([PR](https://github.com/hashicorp/boundary-ui/pull/522))

### Bug Fixes

- Trigger zoom-in menu option on keyboard shortcut. ([PR](https://github.com/hashicorp/boundary-ui/pull/505))
- Boundary Desktop will display readable errors on connect failure. ([PR](https://github.com/hashicorp/boundary-ui/pull/530))
- Project id will be copyable in Boundary Desktop. ([PR](https://github.com/hashicorp/boundary-ui/pull/523))

## v1.0.0-beta [CLI 0.1.8] (2021.03.10)

### New & Improved

- Changes to targets (like adding, removing) are rapidly reflected in Boundary Desktop. ([PR](https://github.com/hashicorp/boundary-ui/pull/487))
- Scrolling now occurs within columns individually so that sidebar and header remain visible when scrolling the application body.  ([PR](https://github.com/hashicorp/boundary-ui/pull/482))

### Changes/Deprecations

- Boundary Desktop is now simply "Boundary".  This change affects macOS asset filenames, as well as the title used within the application.  Documentation will continue to refer to "Boundary Desktop" to avoid confusion with the core binary.  ([PR](https://github.com/hashicorp/boundary-ui/pull/481))
- Boundary origin validation now occurs via Electron's built-in net request module, ensuring the validation request is made via chromium's networking library rather than Node's.  ([PR](https://github.com/hashicorp/boundary-ui/pull/480))

## v1.0.0-alpha [CLI 0.1.6] (2021.02.16)

v1.0.0-alpha is the first release of Boundary Desktop. As a result there are no changes, improvements, or bugfixes from past versions.
