# Core Features Addon for Boundary

This addon contains core features used by Boundary UIs, such as i18n and
helpers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

- [Add core to an App](#add-core-to-an-app)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Linting](#linting)
- [Formatting](#formatting)
- [Running tests](#running-tests)
- [Running the dummy application](#running-the-dummy-application)
- [Contributing](#contributing)
  - [Building ToC](#building-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Add core to an App

Add this addon to an Ember application's `devDependencies` as:
`"core": "*"`, for applications included in this monorepo.

## Installation

See monorepo README for installation instructions.

To use internationalization features, install `ember-intl` into your project:
`ember install ember-intl`.

## I18n

To access translations within a template, see `ember-intl` docs.

## Notifications

To use in-app notifications, first install `ember-notify` in your app.  Then use
the notificaiton decorators to notify the user when a function or action
succeeds or fails.  For example:

```js
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ExampleRoute extends Route {
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async myAction() {
    // do something
  }
}
```

## Confirmations

This addon exposes a service to request confirmations and the component
used to expose them to users.  A decorator is exposed for convenience.

To guard an action on a confirmation, decorate it with `@confirm`. In this
example, the confirmation looks up the translation under a
`questions.delete-confirm` key.

```js
import { confirm } from 'core/decorators/confirm';

export default class ExampleRoute extends Route {
  @confirm('questions.delete-confirm')
  async myAction() {
    // do something
  }
}
```

In the application template, interate over confirmations, yielding the
confirmation instance as well as accept and deny functions which, when called,
update the confirmation status.

```html
<PendingConfirmations as |confirmation accept deny|>
  {{!-- your confirmation dialog component here --}}
</PendingConfirmations
```

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command | Description |
| ------- | ----------- |
| build:development | Builds the dummy app in development mode. |
| build | Builds the dummy app for production. |
| lint | Runs all lint commands. |
| lint:js | Lints `js` files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| start | Runs the dummy app local server. |
| test | Runs all tests. |
| test:all | Runs tests across multiple Ember versions with ember-try. |
| doc:toc | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

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
