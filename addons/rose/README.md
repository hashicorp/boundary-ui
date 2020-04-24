# Rose - Style & Component Ember Addon for Project Watchtower

This addon contains common styles and components shared by
Project Watchtower UIs.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Add Styles to an App](#add-styles-to-an-app)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Linting](#linting)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add Styles to an App

Add this addon to an Ember application's `devDependencies` as:
`"rose": "*"`, for applications included in this monorepo.  Application's
may then import rose styles by adding `@import 'rose';` to their stylesheets.

## Installation

See monorepo README for installation instructions.

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command | Description |
| ------- | ----------- |
| build | Builds the dummy app in development mode. |
| build:production | Builds the dummy app for production. |
| lint | Runs all lint commands. |
| lint:hbs | Lints template `hbs` files. |
| lint:js | Lints `js` files. |
| start | Runs the dummy app local server. |
| test | Runs all tests. |
| test:all | Runs tests across multiple Ember versions with ember-try. |
| doc:toc | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

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
