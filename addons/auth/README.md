# Authentication layer Ember Addon for Boundary

This addon contains the authentication layer for Boundary.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Add to an App](#add-to-an-app)
- [Installation](#installation)
- [Pnpm Commands](#pnpm-commands)
- [Linting](#linting)
- [Formatting](#formatting)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add to an App

Add this addon to an Ember application's `devDependencies` as:
`"auth": "workspace:*"`, for applications included in this monorepo.

## Installation

See monorepo README for installation instructions.

## Pnpm Commands

List of available project commands.  `pnpm run <command-name>`

| Command | Description |
| ------- | ----------- |
| lint | Runs all lint commands. |
| lint:fix | Runs automatic lint fixes for all files. |
| lint:js | Lints `js` files. |
| lint:js:fix | Runs automatic lint fixes for `js` files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| start | Runs the dummy app local server. |
| test | Runs all tests. |
| test:all | Runs tests across multiple Ember versions with ember-try. |
| precommit | Runs all lint, format and tests. |
| doc:toc | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

* `pnpm lint:js`
* `pnpm lint:js --fix`

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
