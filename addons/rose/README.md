# Rose - Style & Component Ember Addon for Boundary

This addon contains common styles and components shared by
Boundary UIs.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [Add Styles to an App](#add-styles-to-an-app)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Linting](#linting)
- [Formatting](#formatting)
- [Building Components](#building-components)
- [Using Components](#using-components)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add Styles to an App

Add this addon to an Ember application's `devDependencies` as:
`"rose": "workspace:*"`, for applications included in this monorepo. Application's
may then import rose styles by adding `@import 'rose';` to their stylesheets.

## Installation

See monorepo README for installation instructions.

## Yarn Commands

List of available project commands. `yarn run <command-name>`

| Command                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| build:development        | Builds the dummy app in development mode.                         |
| build                    | Builds the dummy app for production.                              |
| lint                     | Runs all lint commands.                                           |
| lint:fix                 | Runs automatic lint fixes for all files.                          |
| lint:hbs                 | Lints template `hbs` files.                                       |
| lint:hbs:fix             | Runs automatic lint fixes for `hbs` files.                        |
| lint:js                  | Lints `js` files.                                                 |
| lint:js:fix              | Runs automatic lint fixes for `js` files.                         |
| lint:sass                | Lints `scss` files.                                               |
| format                   | Runs all auto-formatters.                                         |
| format:js                | Auto-formats `js` files using Prettier.                           |
| format:hbs               | Auto-formats `hbs` files using Prettier.                          |
| format:sass              | Auto-formats `scss` files using Prettier.                         |
| start                    | Runs the dummy app local server.                                  |
| test                     | Runs all tests.                                                   |
| test:ember-compatibility | Runs tests across multiple Ember versions with ember-try.         |
| precommit                | Runs all lint, format and tests.                                  |
| doc:toc                  | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

- `yarn lint:hbs`
- `yarn lint:js`
- `yarn lint:js --fix`

## Formatting

Before submitting your work, be sure to run auto-formatters
(see commands above). This helps to ensure consistency among authors.

- `yarn format`

## Building Components

To build a new component, start by generating it on the command line with
`ember g component rose/component-name`.

## Using Components

A few of the components have additional ember package dependencies that need to be installed before usage.

| Component      | Dependency     |
| -------------- | -------------- |
| Rose::Dropdown | ember-modifier |

## Running tests

- `yarn test` – Runs the test suite on the current Ember version
- `yarn test --server` – Runs the test suite in "watch mode"
- `yarn test:all` – Runs the test suite against multiple Ember versions

## Running the dummy application

- `yarn start`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

## Contributing

See monorepo README for more contribution instructions.

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `yarn doc:toc`. Please update the ToC whenever editing the structure
of README.
