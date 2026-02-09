# API data layer Ember Addon for Boundary

This addon contains the API data access layer for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Add API to an App](#add-api-to-an-app)
- [Installation](#installation)
- [Pnpm Commands](#pnpm-commands)
- [Linting](#linting)
- [Formatting](#formatting)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add API to an App

Add this addon to an Ember application's `devDependencies` as:
`"api": "workspace:*"`, for applications included in this monorepo. 

This addon also includes Mirage mocks. To include the `miragejs` dependency and this addon's mirage handlers configure the consuming app's `config/environment.js`

```js
mirage: {
  enabled: true
}
```

Include `miragejs` and any api addon `peerDependencies` used by the mirage as dev dependencies in the consuming app,
eg: `@faker-js/faker`, otherwise mirage handler code might fail with an error.

To have mirage start and intercept requests when the application starts:
1. Add the `@embroider/macros` dependency to your application
2. Configure `@embroider/macros` with `startMirageWithApp` based on app's config within `ember-cli-build.js`:

```js
// ember-cli-build.js
module.exports = async function (defaults) {
  // load the app's config 
  const { EMBER_ENV } = process.env;
  var config = require('./config/environment')(EMBER_ENV);

  const app = new EmberApp(defaults, {
    '@embroider/macros': {
      setOwnConfig: {
        startMirageWithApp: config.mirage?.enabled ?? false
      },
    },
  });
}
```

3. Finally, use the `@embroider/macros` config value for `startMirageWithApp` in `app/app.js` to conditionally start mirage:

```js
import { macroCondition, importSync, getOwnConfig, isTesting } from '@embroider/macros';

if (macroCondition(getOwnConfig().startMirageWithApp && !isTesting())) {
  const startServer = importSync('[name of host app]/mirage/config').default;
  startServer({});
}
```
## Installation

See monorepo README for installation instructions.

When manually installing addon, ensure `ember-data-fragments@5.0.0-beta.*` is installed to use api models with data fragments.

## Pnpm Commands

List of available project commands.  `pnpm run <command-name>`

| Command | Description |
| ------- | ----------- |
| build:development | Builds the dummy app in development mode. |
| build | Builds the dummy app for production. |
| lint | Runs all lint commands. |
| lint:fix | Runs automatic lint fixes for all type of file. |
| lint:hbs | Runs lint for `hbs` template files. |
| lint:hbs:fix | Runs automatic lint fixes for `hbs` template files. |
| lint:js | Lints `js` files. |
| lint:js:fix | Runs automatic lint fixes for `js` files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| start | Runs the dummy app local server. |
| test | Runs all tests. |
| test:ember-compatibility | Runs tests across multiple Ember versions with ember-try. |
| precommit | Runs all lint and format. |
| doc:toc | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

* `pnpm lint:fix`
* `pnpm lint:hbs`
* `pnpm lint:hbs:fix`
* `pnpm lint:js`
* `pnpm lint:js:fix`

## Formatting

Before submitting your work, be sure to run auto-formatters
(see commands above).  This helps to ensure consistency among authors.

* `pnpm format`

## Running tests

* `pnpm test` – Runs the test suite on the current Ember version
* `pnpm test --server` – Runs the test suite in "watch mode"
* `pnpm test:all` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `pnpm start`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

## Contributing

See monorepo README for more contribution instructions.

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `pnpm doc:toc`.  Please update the ToC whenever editing the structure
of README.
