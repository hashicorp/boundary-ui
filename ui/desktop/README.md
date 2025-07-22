# Desktop client UI

The desktop client UI for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Desktop client UI](#desktop-client-ui)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Pnpm Commands](#pnpm-commands)
  - [Running / Development](#running--development)
    - [Developing Using Non-Release Versions of Boundary](#developing-using-non-release-versions-of-boundary)
    - [Environment Variables (DEV)](#environment-variables-dev)
    - [Building for Production](#building-for-production)
      - [Environment Variables (PROD)](#environment-variables-prod)
    - [Running Tests](#running-tests)
    - [Running end to end Tests](#running-end-to-end-tests)
    - [Troubleshooting](#troubleshooting)
      - [Blank screen and/or hang browser tab when running as web app](#blank-screen-andor-hang-browser-tab-when-running-as-web-app)
      - [Node-gyp build errors after package upgrades](#node-gyp-build-errors-after-package-upgrades)
    - [Deploying](#deploying)
  - [Debug desktop client](#debug-desktop-client)
    - [Debug `renderer` process](#debug-renderer-process)
    - [Debug `main` process](#debug-main-process)
    - [Debug `binary`](#debug-binary)
  - [Further Reading / Useful Links](#further-reading--useful-links)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Pnpm](https://pnpm.io/)
- [Ember CLI](https://cli.emberjs.com/release/)
- [Google Chrome](https://google.com/chrome/)

## Installation

See [boundary-ui README](https://github.com/hashicorp/boundary-ui#installation) for installation instructions.

## Pnpm Commands

List of available project commands.  `pnpm run <command-name>`

| Command | Description |
| ------- | ----------- |
| build | Builds the UI for production. |
| build:development | Builds the UI in development mode. |
| lint | Runs all lint commands. |
| lint:fix | Runs all automatic linting fixes. |
| lint:hbs | Lints `hbs` template files. |
| lint:hbs:fix | Runs the automatic linting fix for `hbs` template files. |
| lint:js | Lints `js` files. |
| lint:js:fix | Runs the automatic linting fix for `js` files. |
| lint:sass | Lints `scss` files. |
| lint:electron | Runs a linter tool to identify misconfigurations and security anti-patterns in Electron. |
| format | Runs all auto-formatters. |
| format:hbs | Auto-formats `hbs` files using Prettier. |
| format:js | Auto-formats `js` files using Prettier. |
| format:sass | Auto-formats `scss` files using Prettier. |
| start | Runs the dummy app local server as web app. |
| start:desktop | Runs the dummy app as an electron app. |
| clean:coverage | Cleans coverage reporting directory. |
| test | Runs all tests in random order, with coverage reporting. |
| test:ember | Runs ember tests in random order, with coverage reporting. |
| doc:toc | Automatically generates a table of contents for this README file. |

## Running / Development

To run as web app:

- `pnpm start`
- Visit your app at [http://localhost:4201](http://localhost:4201).
- Visit your tests at [http://localhost:4201/tests](http://localhost:4201/tests).

To run as a desktop app:

- `pnpm start:desktop`

The Boundary CLI is NOT downloaded by default, to download and extract the CLI to `electron-app/cli` folder as part of the build, you need to set the environment variable `SETUP_CLI` to true. Example: `SETUP_CLI=true pnpm start:desktop`.
The CLI version is defined in `electron-app/config/cli/VERSION`.

### Developing Using Non-Release Versions of Boundary

To develop using a non-release version of Boundary, download the Boundary CLI version you want to use and extract it to the `electron-app/cli` folder. You may need to create the directory or clean it up beforehand.

### Environment Variables (DEV)

These environment variables may be used to customized the build.

| Variable | Description |
| -------- | ----------- |
| `DEBUG_APP_UPDATER` | Enable to debug app updater feature. Must be enabled for all `APP_UPDATER_*` variables to be used. |
| `APP_UPDATER_CURRENT_VERSION` | Version of client. |
| `APP_UPDATER_LATEST_VERSION_TAG` | Next version for comparison with current version. |
| `APP_UPDATER_LATEST_VERSION_LOCATION` | Location of app release to use for updating client. Can be a filepath or url. |
| `SETUP_CLI` | Enable download and extraction of CLI. |
| `BYPASS_APP_UPDATER` | Disable app updater feature. For development use only. |
| `DISABLE_WINDOW_CHROME` | Disable window chrome. For internal use only. |
| `ENABLE_MIRAGE` | Enable (`true`) or disable (`false`) mirage. Default value is `true`. |
| `DARK_MODE` | Enable (`true`) to set the test browser appearance to dark for running tests in dark mode. |

### Building for Production

Before executing a build, be sure to set any environment variables necessary
for your target [environment](#environment-variables-prod) and you have full permissions in the environment you want to build in.
To build this UI for production, run the following commands from this folder:

```bash
pnpm install
pnpm build
```

`BOUNDARY_DESKTOP_SIGNING_IDENTITY` environment variable must be provided
to codesign MacOS artifacts in production.

The static production assets are saved into the `dist/` folder.
The Boundary CLI is downloaded and extracted to `electron-app/cli/` folder as part of
packaging. CLI version is defined in `electron-app/config/cli.js`.

Similar to running in development, you can also use `BYPASS_CLI_SETUP=true` to
bypass the download of the CLI, which can be useful for pre-release testing. See
[Developing Using Non-Release Versions of
Boundary](#developing-using-non-release-versions-of-boundary) for more details.

#### Environment Variables (PROD)

These environment variables may be used to customized the build.

| Variable | Default Value | Description |
| -------- | ------------- | ----------- |
| `APP_NAME` | Application Name | The user-facing name of the application, appearing in titles, etc. |
| `BOUNDARY_DESKTOP_SIGNING_IDENTITY` | | The name of the certificate to use when signing (e.g. Developer ID Application: \* (*)). |
| `SETUP_CLI` | Enable download and extraction of CLI. |

### Running Tests

- `pnpm test` runs full tests in random order with coverage
- `DARK_MODE=true ember test --server` runs tests in dark mode

Keep in mind that tests are executed in random order.  This is intentional
and helps to prevent hard-to-debug order dependencies among tests.

Please also note that we report test coverage.  We strive for "the right amount
of testing".  Use test coverage as a guide to help you identify untested
high-value code.

We rely on `ember-a11y-testing` to validate accessibility in acceptance tests.

### Running end to end Tests

**The end-to-end test suite is supported for Mac, x64 and arm64 (M1) chips.**

*Be aware this is a temporary process that can suffer changes and eventually will be automated.*

This process will explain how to run end to end test in your local environment. The process will assume next:

- You already run the Boundary UI [installation process](https://github.com/hashicorp/boundary-ui#installation).
- You have Boundary installed, see [the installation guide](https://learn.hashicorp.com/tutorials/boundary/getting-started-install?in=boundary/getting-started).

Steps:

- Open a terminal and run `$ boundary dev`.
- Open another terminal and navigate to `$ boundary-ui/ui/desktop` folder.
- Run `$ pnpm run e2e` and tests will start run.
- You can check the screenshots the tests take: `desktop/tests/end2end/screenshots`.

### Troubleshooting

#### Blank screen and/or hang browser tab when running as web app

We are aware of an issue of the desktop client not being able to start correctly when running as web app within development mode. This issue reproduces when the developer is enabling/disabling Mirage ([more info](#environment-variables-dev) about environment variables).

The workaround to fix this issue is to reset/clear cookies and data (local storage and session storage).

#### Node-gyp build errors after package upgrades

This issue will likely pop up if you are using Python v3.12 and above as `python-setuptools` is no longer included by default.

If you are running into issues with running the desktop client after a node upgrade you may need to rebuild some tools needed for building the electron app. Be sure to remove `node_models/` for `ui/desktop/` and `ui/desktop/electron-app/` to make sure you have a clean slate. First thing you will need to check is if you have `python-setuptools` installed. It is needed for node-gyp to rebuild the native tools for electron. If you are on a mac and use Homebrew, you can run `brew install python-setuptools`. If you aren't using Homebrew you can run use tthe following command: `python3 -m pip install setuptools`. You should be able to run `pnpm start:desktop` now. This will trigger the rebuild for electron but if you want to be safe you can run `./electron-app/node_modules/.bin/electron-rebuild` before trying to start up the desktop client.

### Deploying

TBD

## Debug desktop client

There are two processes we can debug, `renderer` process and `main` process.

When I do need to debug the `main` process?

To debug code that is just executed in the main process, i.e to debug the `ipcMain` handler.

### Debug `renderer` process

To debug the renderer process, once the electron app is running, open the Chrome DevTools.

You can open the Chrome DevTools programmatically by calling the API on the `webContents` instance:

```javascript
const browserWindow = new BrowserWindow(browserWindowOptions);
browserWindow.webContents.openDevTools()
```

`browserWindow` reference in our code, [here](https://github.com/hashicorp/boundary-ui/blob/main/ui/desktop/electron-app/src/index.js#L84).

### Debug `main` process

To start the electron app with the inspector adding a breakpoint before code starts:

`$ pnpm start:desktop --- --inspect-brk`.

To avoid the breakpoint:

`$ pnpm start:desktop --- --inspect`.

You can use any of [these clients](https://nodejs.org/en/docs/guides/debugging-getting-started/#inspector-clients), but we will use the chrome inspector client. Open chrome and on the url bar: `$ chrome://inspect` and click inspect on the electron instance.

If you start the inspector with the `-brk` (breakpoint) code will not execute until you allow execution to continue (clicking the play button on the inspector).

More information on [debugging the main process](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process).
More information on [Node debugging guide](https://nodejs.org/en/docs/guides/debugging-getting-started/).

### Debug `binary`

The desktop client binary is the end artifact we deliver to customers. More information on how to build the binary in [Building for Production](#building-for-production).

We use [Debugtron](https://github.com/pd4d10/debugtron) to debug the production binary. Debugtron let's you inspect the Electron app as if you were in a dev environment. It also provides debug options for the node process running Electron.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
