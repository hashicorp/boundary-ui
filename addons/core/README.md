# Core Features Addon for Boundary

This addon contains core features used by Boundary UIs, such as i18n and
helpers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Add core to an App](#add-core-to-an-app)
- [Installation](#installation)
- [I18n](#i18n)
- [Notifications](#notifications)
- [Confirmations](#confirmations)
- [App and Company Names](#app-and-company-names)
- [Documentation URLs](#documentation-urls)
- [Loading Helper](#loading-helper)
- [Scope Service](#scope-service)
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
`"core": "workspace:*"`, for applications included in this monorepo.


## Installation

See monorepo README for installation instructions.

## I18n

To access translations within a template, see `ember-intl` docs.

## Notifications

Use notificaiton decorators to notify the user when a function or action
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

In the application template, iterate over confirmations, yielding the
confirmation instance as well as accept and deny functions which, when called,
update the confirmation status.

```html
<PendingConfirmations as |confirmation accept deny|>
  {{!-- your confirmation dialog component here --}}
</PendingConfirmations
```

## App and Company Names

To make use of the `app-name`, `company-name`, and `company-copyright` helpers,
add `appName` an `companyName` keys to your Ember config
(see admin for example).

## Documentation URLs

To render doc links in your application, be sure to configure the links in your
Ember config (see admin).  Then reference doc links by keys:

```html
<DocLink @doc="account" @iconSize="24" />
```

## Loading Helper

See admin and desktop routes and templates for examples of how to
use the loading subsystem.  For example, to annotate that an async action should
present a loading indicator to a user:

```js
@action
@loading
async myAction() {
  // ...do potentially time-consuming task
}
```

## Scope Service

This addon exposes a service to hold all active scopes (org and project where available).

To make use of the service, import it and initialize it using service injection.

```js
import { service } from '@ember/service';

export default class ExampleRoute extends Route {
  @service scope;
  async myAction() {
    // do something
  }
}
```

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command | Description |
| ------- | ----------- |
| build:development | Builds the dummy app in development mode. |
| build | Builds the dummy app for production. |
| lint | Runs all lint commands. |
| lint:js | Lints `js` files. |
| lint:js:fix | Runs automatic lint fixes for `js` files. |
| lint:hbs | Runs lint for `hbs` template files. |
| lint:hbs:fix | Runs automatic lint fixes for `hbs` template files. |
| format | Runs all auto-formatters. |
| format:js | Auto-formats `js` files using Prettier. |
| format:hbs | Auto-formats `hbs` files using Prettier. |
| start | Runs the dummy app local server. |
| test | Runs all tests. |
| test:ember-compatibility | Runs tests across multiple Ember versions with ember-try. |
| precommit | Runs all lint, format and tests. |
| doc:toc | Automatically generates a table of contents for this README file. |

Additional commands in the monorepo package may affect this projects.

## Linting

* `yarn lint:hbs`
* `yarn lint:hbs --fix`
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
