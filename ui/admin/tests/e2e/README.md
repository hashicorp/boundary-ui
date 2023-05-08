# Admin UI e2e tests

This test suite tests the Boundary Admin UI in an end-to-end setting. It was designed to be run in a
variety of environments as long as the appropriate environment variables are set. You can choose to
spin up your own infrastructure or use [Enos](https://github.com/hashicorp/boundary/tree/main/enos)
to generate it for you. More information about [Enos available here.](https://github.com/hashicorp/Enos-Docs)

The test suite uses the [Playwright](https://playwright.dev/) framework.

## Prerequisites:

Most likely, you will need [Hombrebrew](https://brew.sh/) install.

### Accesses

If you are missing any acccess, requested [through the IT service catalog](https://hashicorp.freshservice.com/support/catalog/items).

- Doormat account: `boundary_team_acctest_dev`.
- HCP account: you will need to use Terraform cloud to spin up enos.

### Software

- Vault: [documentation how to install](https://developer.hashicorp.com/vault/tutorials/getting-started/getting-started-install).
- Terraform: [documentation how to install](https://developer.hashicorp.com/terraform/downloads).
- Github CLI: [documentation how to install](https://cli.github.com/manual/installation).
- Install Enos: [documentation how to install using homebrew](https://github.com/hashicorp/Enos-Docs/blob/main/installation.md), also binaries available [here](https://github.com/hashicorp/enos/releases).
- Install Doormat CLI: [documentation how to install](https://docs.prod.secops.hashicorp.services/doormat/cli/).

## Getting Started

### Setup Boundary CLI

Ensure the `boundary` CLI is available on the path. You can validate this by making sure this
command returns something.
```bash
which boundary
```

Otherwise, follow instructions to [install Boundary](https://developer.hashicorp.com/boundary/downloads?product_intent=boundary) or install it locally running `$ make install` within [Boundary repository](https://github.com/hashicorp/boundary/tree/main).

### Setup Boundary UI

Ensure you install project dependencies and playwright needs.

```bash
cd boundary-ui/ui/admin
yarn install
npx playwright install # this installs the browsers used by Playwright
```
### SSH Key pair

The AWS EC2 instance we need to setup later requires providing SSH Key pair. We recommend creating specific e2e SSH keys and not re-use existing ones. To differentiate them, we recommend adding `enos` to the name, i.e: `name_enos`.

Run tests...
```bash
export BOUNDARY_ADDR=
export E2E_PASSWORD_ADMIN_LOGIN_NAME=
export E2E_PASSWORD_ADMIN_PASSWORD=
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
