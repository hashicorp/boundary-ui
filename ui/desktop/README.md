# Desktop client UI

The desktop client UI for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Running / Development](#running--development)
    - [Environment Variables](#environment-variables)
  - [Building for Production](#building-for-production)
    - [Environment Variables](#environment-variables-1)
  - [Running Tests](#running-tests)
  - [Deploying](#deploying)
- [Further Reading / Useful Links](#further-reading--useful-links)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
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

### Deploying

TBD

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
