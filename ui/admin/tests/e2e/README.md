# Admin UI e2e tests

This test suite tests the Boundary Admin UI in an end-to-end setting. It was designed to be run in a
variety of environments as long as the appropriate environment variables are set. You can choose to
spin up your own infrastructure or use [Enos](https://github.com/hashicorp/boundary/tree/main/enos)
to generate it for you. There is an enos scenario in the `boundary` repository that runs these
tests.

The test suite uses the [Playwright](https://playwright.dev/) framework.

## Getting Started
Setup...
```bash
cd boundary-ui/ui/admin
yarn install
npx playwright install
```

Run tests...
```bash
export BOUNDARY_ADDR=
export E2E_PASSWORD_ADMIN_LOGIN_NAME=
export E2E_PASSWORD_ADMIN_LOGIN_PASSWORD=
export E2E_PASSWORD_AUTH_METHOD_ID=
... # Tests may have additional variables that it needs
cd boundary-ui/ui/admin
yarn run e2e
```

Here are some additional commands to assist with debugging.
```bash
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js:13 --debug
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js --debug
```

## Developing Tests

It is recommended to use locators that resemble how users interact with the application. `getByRole`
should be the most prioritized locator as this is the closest way to how users and
accessibility features perceive the page. `getByLabel` should be used for form fields.

Additional information can be found [here](https://playwright.dev/docs/locators#locating-elements)
and [here](https://testing-library.com/docs/queries/about/#priority).
