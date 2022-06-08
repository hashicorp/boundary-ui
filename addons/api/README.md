# API data layer Ember Addon for Boundary

This addon contains the API data access layer for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Add API to an App](#add-api-to-an-app)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Linting](#linting)
- [Formatting](#formatting)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add API to an App

Add this addon to an Ember application's `devDependencies` as:
`"api": "*"`, for applications included in this monorepo.

Since this addon also includes Mirage mocks, be sure to install
`ember-cli-mirage` and add the following config to your UI project:

```js
'ember-cli-mirage': {
  directory: '../../addons/api/mirage'
}
```

## Installation

See monorepo README for installation instructions.

When manually installing addon, ensure `ember-data-fragments@5.0.0-beta.*` is installed to use api models with data fragments.

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

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

* `yarn lint:fix`
* `yarn lint:hbs`
* `yarn lint:hbs:fix`
* `yarn lint:js`
* `yarn lint:js:fix`

## Formatting

Before submitting your work, be sure to run auto-formatters
(see commands above).  This helps to ensure consistency among authors.

* `yarn format`

## Running tests

* `yarn test` – Runs the test suite on the current Ember version
* `yarn test --server` – Runs the test suite in "watch mode"
* `yarn test:all` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `yarn start`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

## Contributing

See monorepo README for more contribution instructions.

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `yarn doc:toc`.  Please update the ToC whenever editing the structure
of README.
