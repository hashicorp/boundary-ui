# Boundary Desktop CHANGELOG

Canonical reference for changes, improvements, and bugfixes for Boundary Desktop.

## V2.3.3 [CLI 0.19.3] (2025.07.08)

### New & Improved

- Add search and pagination support for host sources. ([PR](https://github.com/hashicorp/boundary-ui/pull/2861))
- Updates to fetching hosts. ([PR](https://github.com/hashicorp/boundary-ui/pull/2877))

### Bug Fixes

- Fix incorrect authentication failure message during vault integration. ([PR](https://github.com/hashicorp/boundary-ui/pull/2772))
- Fix refresh functionality in Targets and Sessions. ([PR](https://github.com/hashicorp/boundary-ui/pull/2889))


## V2.3.2 [CLI 0.19.2] (2025.05.08)

### Bug Fixes

- Fix target search field race condition. ([PR](https://github.com/hashicorp/boundary-ui/pull/2723))
- Remove "Check for Updates" menu item when desktop client is installed through the Boundary installer. ([PR](https://github.com/hashicorp/boundary-ui/pull/2754))

## V2.3.1 [CLI 0.19.1] (2025.03.04)

### Bug Fixes

- Fix re-authentication issue when re-opening Desktop Client. ([PR](https://github.com/hashicorp/boundary-ui/pull/2701))

## V2.3.0 [CLI 0.19.0] (2025.02.10)

### New & Improved

- Upgrade CLI to v0.19.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/2670))
- Update how we display brokered credentials from Vault ([PR](https://github.com/hashicorp/boundary-ui/pull/2583))
- Update how we display brokered static JSON credentials ([PR](https://github.com/hashicorp/boundary-ui/pull/2611))

### Bug Fixes

- Fix memory leak for OIDC authentication ([PR](https://github.com/hashicorp/boundary-ui/pull/2640))

## V2.2.0 [CLI 0.18.0] (2024.10.14)

### New

- Upgrade CLI to v0.18.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/2516))
- Added support for notifications with transparent sessions ([PR](https://github.com/hashicorp/boundary-ui/pull/2336))
- Added a user settings page for configuration options ([PR](https://github.com/hashicorp/boundary-ui/pull/2499))
- Changed the limit of shown results to 250 and an indicator when cache daemon is loading ([PR](https://github.com/hashicorp/boundary-ui/pull/2500))
- Show username credentials before passwords ([PR](https://github.com/hashicorp/boundary-ui/pull/2494))

### Bug Fixes

- Fix cache daemon getting terminated when started before desktop client ([PR](https://github.com/hashicorp/boundary-ui/pull/2480))
- Fix issue where intel macs weren't getting auto-update prompt ([PR](https://github.com/hashicorp/boundary-ui/pull/2419))
- Fix retrying a failed OIDC authentication not working ([PR](https://github.com/hashicorp/boundary-ui/pull/2512))


## V2.1.0 [CLI 0.17.0] (2024.07.31)

### New

- Upgrade CLI to v0.17.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/2396))
- Add logging for the client ([PR](https://github.com/hashicorp/boundary-ui/pull/2318))
- Add support for auto-updating to ARM64 Mac Clients ([PR](https://github.com/hashicorp/boundary-ui/pull/2327))
- Update client license to BSL ([PR](https://github.com/hashicorp/boundary-ui/pull/2307))


## V2.0.3 [CLI 0.16.0] (2024.03.30)

### New

- Upgrade CLI to v0.16.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/2280))
- Add Aliases support ([PR](https://github.com/hashicorp/boundary-ui/pull/2256))
- Darwin ARM64 Support.

### Bug Fixes

- Fix client daemon search for Windows ([PR](https://github.com/hashicorp/boundary-ui/pull/2245))

## v2.0.2 [CLI 0.15.3] (2024.03.18)

### New

- Upgrade CLI to v0.15.3 ([PR](https://github.com/hashicorp/boundary-ui/pull/2183))

### Bug Fixes

- Fix auto-updater ([PR](https://github.com/hashicorp/boundary-ui/pull/2179))


## v2.0.1 [CLI 0.15.1] (2024.02.29)

### New

- Upgrade CLI to v0.15.1 ([PR](https://github.com/hashicorp/boundary-ui/pull/2165))
- Display only scopes with auth-methods at authenticate ([PR](https://github.com/hashicorp/boundary-ui/pull/2129))

### Bug Fixes

- Fix refresh for Windows ([PR](https://github.com/hashicorp/boundary-ui/pull/2133))
- Add error notification if adding token to daemon fails ([PR](https://github.com/hashicorp/boundary-ui/pull/2127))


## v2.0.0 [CLI 0.15.0] (2024.01.31)

### New

- Upgrade CLI to v0.15.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/2117))
- Add search, filtering, and pagination support for sessions and targets ([PR](https://github.com/hashicorp/boundary-ui/pull/2091))
- Add time-remaining to a session ([PR](https://github.com/hashicorp/boundary-ui/pull/2018))

### Bug Fixes

- Fix copy command not working in embedded terminal for Windows OS ([PR](https://github.com/hashicorp/boundary-ui/pull/2001))


## v1.7.1 [CLI 0.14.2] (2023.11.07)

### New

- Upgrade CLI to v0.14.2 ([PR](https://github.com/hashicorp/boundary-ui/pull/1985))
- Add cancel permission checks for sessions ([PR](https://github.com/hashicorp/boundary-ui/pull/1980))
- Allow auto connect to SSH targets on windows ([PR](https://github.com/hashicorp/boundary-ui/pull/1971))

### Bug Fixes

- Fix brokered credentials text overflow ([PR](https://github.com/hashicorp/boundary-ui/pull/1982))
- Fix session permission issue ([PR](https://github.com/hashicorp/boundary-ui/pull/1975))
- Add read:self permission for sessions ([PR](https://github.com/hashicorp/boundary-ui/pull/1974))
- Fix host-set permission issue ([PR](https://github.com/hashicorp/boundary-ui/pull/1968))


## v1.7.0 [CLI 0.14.0] (2023.10.10)

### New

- Upgrade CLI to v0.14.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/1923))
- Update Connection workflow ([PR](https://github.com/hashicorp/boundary-ui/pull/1919))
- Add Embedded Terminal ([PR](https://github.com/hashicorp/boundary-ui/pull/1884))


## v1.6.0 [CLI 0.13.0] (2023.06.12)

### New

- Upgrade CLI to v0.13.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/1712))
- Display external names when listing dynamic hosts ([PR](https://github.com/hashicorp/boundary-ui/pull/1664))
- Add support for LDAP authentication ([PR](https://github.com/hashicorp/boundary-ui/pull/1645))

### Bug Fixes

- Optimized API Queries ([PR](https://github.com/hashicorp/boundary-ui/pull/1707))


## v1.5.1 [CLI 0.12.0] (2023.02.13)

### New

- Upgrade CLI to v0.12.0 ([PR](https://github.com/hashicorp/boundary-ui/pull/1625))

### Bug Fixes

- Fix raw API output not displaying until clicked ([PR](https://github.com/hashicorp/boundary-ui/pull/1354))
- Fix complex secrets not displaying correctly ([PR](https://github.com/hashicorp/boundary-ui/pull/1551))


## v1.5.0 [CLI 0.11.0] (2022.09.27)

### New

- Add syntax highlighting when viewing raw API output for credentials ([PR](https://github.com/hashicorp/boundary-ui/pull/1271))


## v1.4.5 [CLI 0.9.1] (2022.07.06)

### Bug Fixes

- Enable filtering terminated sessions ([PR](https://github.com/hashicorp/boundary-ui/pull/1169)) 
- Fix dropdown overflow issue ([PR](https://github.com/hashicorp/boundary-ui/pull/1160)) 


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
