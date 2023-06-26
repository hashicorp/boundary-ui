# Desktop client UI

The desktop client UI for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Running / Development](#running--development)
  - [Developing Using Non-Release Versions of Boundary](#developing-using-non-release-versions-of-boundary)
  - [Environment Variables](#environment-variables)
  - [Building for Production](#building-for-production)
    - [Environment Variables](#environment-variables-1)
  - [Running Tests](#running-tests)
  - [Running end to end Tests](#running-end-to-end-tests)
  - [Troubleshooting](#troubleshooting)
    - [Blank screen and/or hang browser tab when running as web app](#blank-screen-andor-hang-browser-tab-when-running-as-web-app)
  - [Deploying](#deploying)
- [Debug desktop client](#debug-desktop-client)
  - [Debug `renderer` process](#debug-renderer-process)
  - [Debug `main` process ](#debug-main-process)
  - [Debug `binary`](#debug-binary)
- [Further Reading / Useful Links](#further-reading--useful-links)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://cli.emberjs.com/release/)
* [Google Chrome](https://google.com/chrome/)

## Installation

See [boundary-ui README](https://github.com/hashicorp/boundary-ui#installation) for installation instructions.

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command | Description |
| ------- | ----------- |
| build | Builds the UI for production. |
| build:development | Builds the UI in development mode. |
| build:desktop:debianOnMacOS | Builds debian based linux artifacts on MacOS. |
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
* `yarn start`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

To run as a desktop app:
* `yarn start:desktop`

The Boundary CLI is downloaded and extracted to `electron-app/cli/` folder as part of
build. CLI version is defined in `electron-app/config/cli.js`.

### Developing Using Non-Release Versions of Boundary

You can also develop using a non-release version of Boundary - bypassing the
above CLI download behavior - by manually placing the version of Boundary that
you want to develop with in the `electron-app/cli/` directly (you may need to
create the directory).

After doing this, run yarn with `BYPASS_CLI_SETUP=true`; example: 
`BYPASS_CLI_SETUP=true yarn start:desktop`.

### Environment Variables

These environment variables may be used to customized the build.

| Variable | Description |
| -------- | ----------- |
| `DEBUG_APP_UPDATER` | Enable to debug app updater feature. Must be enabled for all `APP_UPDATER_*` variables to be used. |
| `APP_UPDATER_CURRENT_VERSION` | Version of client. |
| `APP_UPDATER_LATEST_VERSION_TAG` | Next version for comparison with current version. |
| `APP_UPDATER_LATEST_VERSION_LOCATION` | Location of app release to use for updating client. Can be a filepath or url. |
| `BYPASS_CLI_SETUP` | Disable download and extraction of cli. For development use only. |
| `BYPASS_APP_UPDATER` | Disable app updater feature. For development use only. |
| `DISABLE_WINDOW_CHROME` | Disable window chrome. For internal use only. |
| `ENABLE_MIRAGE` | Enable (`true`) or disable (`false`) mirage. Default value is `true`. |

### Building for Production

Before executing a build, be sure to set any environment variables necessary
for your target [environment](#environment-variables). To build this UI for
production, run the following commands from this folder:

```bash
yarn install
yarn build
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

To build debian based linux artifacts on MacOS, additional [MacOS tools](https://www.electronforge.io/config/makers/deb) need to be installed before running the following commands from this folder.

```
yarn install
yarn build:production # Build assets
yarn build:desktop:debianOnMacOS # Build app
```

#### Environment Variables

These environment variables may be used to customized the build.

| Variable | Default Value | Description |
| -------- | ------------- | ----------- |
| `APP_NAME` | Application Name | The user-facing name of the application, appearing in titles, etc. |
| `BOUNDARY_DESKTOP_SIGNING_IDENTITY` | | The name of the certificate to use when signing (e.g. Developer ID Application: * (*)). |
| `BYPASS_CLI_SETUP` | Set to `true` to launch without bootstrapping the CLI (see above). |

### Running Tests

* `yarn test` runs full tests in random order with coverage

Keep in mind that tests are executed in random order.  This is intentional
and helps to prevent hard-to-debug order dependencies among tests.

Please also note that we report test coverage.  We strive for "the right amount
of testing".  Use test coverage as a guide to help you identify untested
high-value code.

We rely on `ember-a11y-testing` to validate accessibility in acceptance tests.
If you write acceptance tests, please ensure at least one validation per
route using `await a11yAudit();`.

### Running end to end Tests

**The end-to-end test suite is supported for Mac, x64 and arm64 (M1) chips.**

*Be aware this is a temporary process that can suffer changes and eventually will be automated.*

This process will explain how to run end to end test in your local environment. The process will assume next:
- You already run the Boundary UI [installation process](https://github.com/hashicorp/boundary-ui#installation).
- You have Boundary installed, see [the installation guide](https://learn.hashicorp.com/tutorials/boundary/getting-started-install?in=boundary/getting-started).

Steps:
- Open a terminal and run `$ boundary dev`.
- Open another terminal and navigate to `$ boundary-ui/ui/desktop` folder.
- Run `$ yarn run e2e` and tests will start run.
- You can check the screenshots the tests take: `desktop/tests/end2end/screenshots`.


### Troubleshooting

#### Blank screen and/or hang browser tab when running as web app

We are aware of an issue of the desktop client not being able to start correctly when running as web app within development mode. This issue reproduces when the developer is enabling/disabling Mirage (more info about environment variables).

The workaround to fix this issue is to reset/clear reset cookies and data (local storage and session storage).
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

`$ yarn start:desktop --- --inspect-brk`.

To avoid the breakpoint:

`$ yarn start:desktop --- --inspect`.

You can use any of [these clients](https://nodejs.org/en/docs/guides/debugging-getting-started/#inspector-clients), but we will use the chrome inspector client. Open chrome and on the url bar: `$ chrome://inspect` and click inspect on the electron instance.

If you start the inspector with the `-brk` (breakpoint) code will not execute until you allow execution to continue (clicking the play button on the inspector).

More information on [debugging the main process](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process).
More information on [Node debugging guide](https://nodejs.org/en/docs/guides/debugging-getting-started/).

### Debug `binary`

The desktop client binary is the end artifact we deliver to customers. More information on how to build the binary in [Building for Production](#building-for-production).

We use [Debugtron](https://github.com/pd4d10/debugtron) to debug the production binary. Debugtron let's you inspect the Electron app as if you were in a dev environment. It also provides debug options for the node process running Electron.


## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
