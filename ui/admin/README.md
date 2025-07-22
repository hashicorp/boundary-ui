# Admin UI

The Admin UI for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Admin UI](#admin-ui)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Pnpm Commands](#pnpm-commands)
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
* [Pnpm](https://pnpm.io/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)
* [Firefox](https://www.mozilla.org/firefox)

## Installation

See monorepo README for installation instructions.

## Pnpm Commands

List of available project commands.  `pnpm run <command-name>`

| Command | Description |
| ------- | ----------- |
| build:development | Builds the Admin UI in development mode. |
| build | Builds the Admin UI for production. |
| lint | Runs all lint commands. |
| lint:hbs | Lints `hbs` template files. |
| lint:js | Lints `js` files. |
| lint:sass | Lints `scss` files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| format:sass | Auto-formats `scss` files using Prettier. |
| start | Runs the dummy app local server. |
| test | Runs all tests in random order, with coverage reporting. |
| doc:toc | Automatically generates a table of contents for this README file. |

## Running / Development

- `ember serve`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Building for Production

Before executing a build, be sure to set any environment variables necessary
for your target environment (see next section).  To build this UI for
production, run the following commands from this folder:

```bash
pnpm install
pnpm build
```

The static production assets are saved into the `dist/` folder.

#### Environment Variables

These environment variables may be used to customized the build.

| Variable | Default Value | Description |
| -------- | ------------- | ----------- |
| `APP_NAME` | Application Name | The user-facing name of the application, appearing in titles, etc. |
| `API_HOST` | | The host of the API, if different than UI (e.g. https://example.net:1234). |
| `DARK_MODE` | | Enable (`true`) to set the test browser appearance to dark for running tests in dark mode. |

### Running Tests

* `pnpm test` runs full tests in random order with coverage
* `ember test --server`
* `DARK_MODE=true ember test --server` runs tests in dark mode

Keep in mind that tests are executed in random order.  This is intentional
and helps to prevent hard-to-debug order dependencies among tests.

Please also note that we report test coverage.  We strive for "the right amount
of testing".  Use test coverage as a guide to help you identify untested
high-value code.

We rely on `ember-a11y-testing` to validate accessibility in acceptance tests.

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
