# Boundary Developer conventions

## I18n:

We use [ember-intl](https://ember-intl.github.io/ember-intl/) to manage i18n. All the code related to i18n lives within [the core addon](https://github.com/hashicorp/boundary-ui/tree/main/addons/core).

All the features provided by ember-intl are available to use, on top of that, the Boundary team [provides some custom helpers](https://github.com/hashicorp/boundary-ui/tree/main/addons/core/addon/helpers).

### Dates & Time

Dates and time must be expressed when possible using the [`<time>` HTML element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time).

The desired date format for the Boundary teams is: `YYYY-MM-DD HH-MM-SS TZ`

### Strings

Plain text strings must be avoided, we use a rule [(`no-bare-strings`)](https://github.com/ember-template-lint/ember-template-lint/blob/master/docs/rule/no-bare-strings.md) within our linter to avoid committing plain text strings.

To learn how to add a translation, [check documentation](https://ember-intl.github.io/ember-intl/docs/quickstart#2-add-your-first-translation).

All our translations files are located [in the translations folder](https://github.com/hashicorp/boundary-ui/tree/main/addons/core/translations) within Core Addon, check the specific [translations Readme](https://github.com/hashicorp/boundary-ui/blob/main/addons/core/translations/README.md) to learn more about it.

To learn more how to use a translation on the templates checkout [the `t` helper documentation](https://ember-intl.github.io/ember-intl/docs/helpers/t).

### A11y Auditing

We use `a11yAudit()` in our acceptance tests to verify that we have no a11y violations in our app. Every route needs to be audited along with each change on the DOM. For example, we should audit the listing of auth methods and audit when we filter auth methods. As well as any dropdowns or modals that may show up on the page.

Admin UI and Desktop both have light and dark color themes that each need to be audited. To address this effectively, we use `test.each()` to loop over a11y test. Once for light theme and again for dark theme. See [auth-methods list](https://github.com/hashicorp/boundary-ui/blob/main/ui/admin/tests/acceptance/auth-methods/list-test.js) for how these tests should be structured.
