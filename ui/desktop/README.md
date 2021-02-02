# Client Connect UI

The client UI for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Running / Development](#running--development)
  - [Building for Production](#building-for-production)
    - [Environment Variables](#environment-variables)
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

See boundary-ui README for installation instructions.

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command | Description |
| ------- | ----------- |
| build:development | Builds the UI in development mode. |
| build | Builds the UI for production. |
| lint | Runs all lint commands. |
| lint:hbs | Lints `hbs` template files. |
| lint:js | Lints `js` files. |
| lint:sass | Lints `scss` files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| format:sass | Auto-formats `scss` files using Prettier. |
| start | Runs the dummy app local server. |
| start:desktop | Runs the dummy app as an electron app. |
| test | Runs all tests in random order, with coverage reporting. |
| doc:toc | Automatically generates a table of contents for this README file. |


## Running / Development

* `yarn start`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

To run as a desktop app:
* `yarn start:desktop`

The Boundary CLI is downloaded and extracted to `electron-app/cli/` folder as part of
build. CLI version is defined in `electron-app/config/cli.js`.

### Building for Production

Before executing a build, be sure to set any environment variables necessary
for your target [environment](#environment-variables).  To build this UI for
production, run the following commands from this folder:

```bash
yarn install
yarn build
```

`BOUNDARY_DESKTOP_SIGNING_IDENTITY` environment variable must be provided
to codesign in production.

The static production assets are saved into the `dist/` folder.
The Boundary CLI is downloaded and extracted to `electron-app/cli/` folder as part of
packaging. CLI version is defined in `electron-app/config/cli.js`.

#### Environment Variables

These environment variables may be used to customized the build.

| Variable | Default Value | Description |
| -------- | ------------- | ----------- |
| `APP_NAME` | Application Name | The user-facing name of the application, appearing in titles, etc. |
| `BOUNDARY_DESKTOP_SIGNING_IDENTITY` | | The name of the certificate to use when signing (e.g. Developer ID Application: * (*)). |

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
