<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Boundary UI E2E tests](#boundary-ui-e2e-tests)
  - [Prerequisites:](#prerequisites)
    - [Accesses](#accesses)
    - [Software](#software)
  - [Getting Started](#getting-started)
    - [Set up Boundary CLI](#set-up-boundary-cli)
    - [Setup Boundary UI](#setup-boundary-ui)
    - [Setup AWS:](#setup-aws)
    - [Setup Enos:](#setup-enos)
  - [Run tests:](#run-tests)
    - [Choosing the Correct Enos Scenario](#choosing-the-correct-enos-scenario)
      - [Admin](#admin)
      - [Desktop](#desktop)
    - [Launch Enos Scenario](#launch-enos-scenario)
      - [Admin](#admin-1)
        - [Admin (Using a Local Branch)](#admin-using-a-local-branch)
      - [Desktop](#desktop-1)
    - [Destroy Enos Scenario](#destroy-enos-scenario)
  - [Developing Tests](#developing-tests)
    - [Test names and tagging](#test-names-and-tagging)
    - [Selecting / Locating Elements](#selecting--locating-elements)
    - [Api Client Fixture](#api-client-fixture)
      - [Using the fixture](#using-the-fixture)
      - [Features](#features)
      - [Generating the api client](#generating-the-api-client)
    - [Testing with resources (api, page objects, cli)](#testing-with-resources-api-page-objects-cli)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Boundary UI E2E tests

This test suite tests the Boundary admin UI and desktop client in an end-to-end setting. It was designed to be run in a
variety of environments as long as the appropriate environment variables are set. You can choose to
spin up your own infrastructure or use [Enos](https://github.com/hashicorp/boundary/tree/main/enos)
to generate it for you. More information about [Enos available here.](https://github.com/hashicorp/Enos-Docs)

The test suite uses the [Playwright](https://playwright.dev/) framework.

## Prerequisites:

You will need [Homebrew](https://brew.sh/) installed. To securely store your SSH keys and tokens we recommend using 1Password.

### Accesses

- Doormat account: `boundary_team_acctest_dev`.
  - Request access through Doormat.

### Software

- Vault: [documentation how to install](https://developer.hashicorp.com/vault/tutorials/getting-started/getting-started-install).
- Terraform: [documentation how to install](https://developer.hashicorp.com/terraform/downloads).
- Github CLI: [documentation how to install](https://cli.github.com/manual/installation).
- Install Enos: [documentation how to install using homebrew](https://github.com/hashicorp/Enos-Docs/blob/main/installation.md), also binaries available [here](https://github.com/hashicorp/enos/releases).
- Install Doormat CLI: [documentation how to install](https://docs.prod.secops.hashicorp.services/doormat/cli/).
- Install AWS CLI (Optional): [documentation how to install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

## Getting Started

We will cover everything you need to set up before being able to run Enos + the tests.

### Set up Boundary CLI

Ensure the `boundary` CLI is available on the path. You can validate this by making sure this
command returns something.

```bash
which boundary
```

Otherwise, follow instructions to [install Boundary](https://developer.hashicorp.com/boundary/downloads?product_intent=boundary) or install it locally running `make install` within [Boundary repository](https://github.com/hashicorp/boundary/tree/main).

### Setup Boundary UI

Ensure you install project dependencies and playwright needs.

```bash
cd boundary-ui/e2e-tests/admin
pnpm install
npx playwright install # this installs the browsers used by Playwright
```

### Setup AWS:

**Region awareness:** take note of the AWS region you are setting up because we will need it later to configure enos. We recommend `us-east-1`. [More information about AWS regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html).

**SSH Key pair:**

You need to provide an SSH Key pair for the EC2 instance. We recommend creating specific e2e SSH keys and not re-use existing ones. To differentiate them, we recommend adding `enos` to the name, i.e: `name_enos`.

[How to create EC2 SSH key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

If you would like to do it through the command line:

```bash
doormat login
source <(doormat aws export --account boundary_team_acctest_dev)
# Feel free to use a custom name for your key pair if you don't want to use $USER, just make sure it follows the <name>_enos format so it can be identified. e.g. zed_enos
ssh-keygen -N '' -t ed25519 -f ~/.ssh/"$USER"_enos
aws ec2 import-key-pair \
  --region us-east-1 \
  --key-name "$USER"_enos \
  --public-key-material fileb://~/.ssh/"$USER"_enos.pub
```

### Setup Enos:

Make sure you're in the correct boundary repository for the version of Boundary you plan on using.
The enos scenarios for CE need to be run in `boundary` and the enos scenarios for enterprise need to be run in `boundary-enterprise`.

Enos needs some configuration variables to run the scenario successfully. [See the configuration file](https://github.com/hashicorp/boundary/blob/main/enos/enos.vars.hcl). The file has comments per each variable, but some awareness:

- `boundary_edition`: The edition of Boundary you are using. Options are `oss` or `enterprise`.
- `aws_region`: The AWS region you are using. Very important as mentioned within the EC2 Setup.
- `aws_ssh_keypair_name`: The name of the AWS keypair.
- `aws_ssh_private_key_path`: The path to the private key associated with your keypair.
- `enos_user`: The user name to use for tagged resources in AWS.
- `e2e_debug_no_run`: Make sure this is set to true.
- `boundary_license_path` (enterprise only): Path to an enterprise license

More documentation about [scenario variables](https://github.com/hashicorp/boundary/tree/main/enos#scenarios-variables).

## Run tests:
Make sure you followed all the steps within the [Getting started section](#getting-started).

### Choosing the Correct Enos Scenario
Before running e2e tests locally, we need to launch the correct Enos Scenario.

#### Admin
Tests names are tagged (eg: `@docker`) to show which enos scenarios are supported. Some tests will support multiple tags while others require a specific enos scenario in order to run successfully. Put another way, not all tests will run successfully under all enos scenarios. Either check the test name and its corresponding tags or use the `--list` flag for any playwright command to output tests covered:
* `pnpm admin:ce:aws --list`
* `pnpm admin:ce:docker --list`
* `pnpm admin:ent:aws --list`
* `pnpm admin:ent:docker --list`

Corresponding Enos Scenario for Given Tags
|               | `@aws`                     | `@docker`                     |
| ------------- | -------------------------- | ----------------------------- |
| `@ce`         | scenario: `e2e_ui_aws`     | scenario: `e2e_ui_docker`     |
| `@enterprise` | scenario: `e2e_ui_aws_ent` | scenario: `e2e_ui_docker_ent` |

#### Desktop

Currently the desktop client e2e tests assumes using an enterprise enos scenario, either: `e2e_ui_aws_ent` (with aws) or `e2e_ui_docker_ent`  (with docker)

### Launch Enos Scenario

It is not necessary, but from this point we recommend having 2 terminals open.

- Terminal 1: Will be used to run enos (Boundary).
- Terminal 2: Will be used to run e2e UI tests (Boundary UI).

Using Terminal 1:

- `cd boundary/enos` or `cd boundary_enterprise/enos`.
- `doormat login`. Login with Doormat.
- `eval "$(doormat aws export --account boundary_team_acctest_dev)"`. Exporting AWS env variables from doormat to your terminal.
- `enos scenario launch e2e_ui_aws builder:local` or `enos scenario launch e2e_ui_aws_ent builder:local` if in enterprise.
  - Launches enos scenario, this will take from 5 to 10 minutes. When its done, you will see a Enos Operations finished! within your terminal. Check out more scenarios [here](https://github.com/hashicorp/boundary/tree/main/enos).
- `bash scripts/test_e2e_env.sh`. Prints all the env variables within Enos scenario. Copy the output and paste it within your Terminal 2 (Boundary UI). These env variables are needed within Boundary UI to run the test against the enos scenario.

Alternatively, you can also redirect the output to an `.env` file that will get picked up by tests automatically which is useful if you're running tests in your IDE:
```
bash scripts/test_e2e_env.sh > (boundary-ui directory)/e2e-tests/.env
```

> [!IMPORTANT]
> Be aware that once an aws scenario is launched you will create and run resources within AWS. After you are done using the scenario, [you should destroy it](#destroy-enos-scenario). This isn't necessary but still a good idea for docker enos scenarios.

#### Admin

Using Terminal 2:

Set the env variables `test_e2e_env.sh` script output in this terminal.

```bash
cd boundary-ui/e2e-tests
```

Run the command for the corresponding enos scenario to run all supported tests:
|               | `@aws`                            | `@docker`                            |
| ------------- | --------------------------------- | ------------------------------------ |
| `@ce`         | command: `pnpm run admin:ce:aws`  | command: `pnpm admin:ce:docker`      |
| `@enterprise` | command: `pnpm run admin:ent:aws` | command: `pnpm run admin:ent:docker` |


Here are some additional commands to assist with debugging.

```bash
PWDEBUG=console pnpm playwright test --headed --config admin/playwright.config.js login.spec.js
PWDEBUG=console pnpm playwright test --headed --config admin/playwright.config.js login.spec.js:13 --debug
PWDEBUG=console pnpm playwright test --headed --config admin/playwright.config.js login.spec.js --debug
```

##### Admin (Using a Local Branch)

```shell
# In one terminal, run the `test_e2e_env.sh` script, and then do the following...
cd boundary-ui/
ENABLE_MIRAGE=false API_HOST=$BOUNDARY_ADDR pnpm -F admin start

# In another terminal, run the `test_e2e_env.sh` script and then do the following...
cd boundary-ui/e2e-tests
BOUNDARY_ADDR_BRANCH="http://localhost:4200" pnpm run admin:{edition}:{infra} # Example: pnpm run admin:ce:aws
```

#### Desktop

> [!NOTE]
> Currently the desktop client e2e tests assumes that the Boundary server is an enterprise edition.

Using Terminal 2:

Set the env variables `test_e2e_env.sh` script output in this terminal.

```bash
cd boundary-ui/e2e-tests
pnpm run desktop
```

[Playwright documentation about running tests](https://playwright.dev/docs/running-tests).

### Destroy Enos Scenario

Using Terminal 1:

Destroy the previously launched enos scenario:

```bash
# aws / ce
enos scenario destroy e2e_ui_aws builder:local
```

```bash
# aws / enterprise
enos scenario destroy e2e_ui_aws_ent builder:local
```

```bash
# docker / ce
enos scenario destroy e2e_ui_docker builder:local
```

```bash
# docker / enterprise
enos scenario destroy e2e_ui_docker_ent builder:local
```

After all the steps pass, you should see a `Enos operations finished!`.

## Developing Tests

### Test names and tagging
For admin tests, it's important to tag the test with the correct tags to denote which enos scenario is supported by the test. The test tags should have at least specifying the edition (`@ce`, `@ent`) and at least one specifying the enos test infrastructure (`@aws`, or `@docker`).

The `@ent` and `@ce` tags should be added to *all* and *any* test cases that are supported by the respective editions. If a test case can be ran in both editions it should have both tags.

### Selecting / Locating Elements
It is recommended to use locators that resemble how users interact with the application. `getByRole`
should be the most prioritized locator as this is the closest way to how users and
accessibility features perceive the page. `getByLabel` should be used for form fields.

Additional information can be found [here](https://playwright.dev/docs/locators#locating-elements)
and [here](https://testing-library.com/docs/queries/about/#priority).

### Api Client Fixture
The `apiClient` fixture is available in tests to make calls against the boundary api. This fixture wraps an api client that is auto-generated from the [boundary api openapi swagger spec](https://raw.githubusercontent.com/hashicorp/boundary/main/internal/gen/controller.swagger.json).

#### Using the fixture
The api client fixture can be used in tests anywhere fixtures are available:
```js
// within a test
test(
  'An example test',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ apiClient }) => {
    org = await apiClient.clients.Scope.scopeServiceCreateScope({
      item: {
        name: 'Org A',
        scopeId: 'global',
      },
    });
  }
);

// in `beforeEach` (also works the same for `afterEach`)
test.beforeEach(async ({ apiClient }) => {
  org = await apiClient.clients.Scope.scopeServiceCreateScope({
    item: {
      name: 'Org A',
      scopeId: 'global',
    },
  });
});
```

#### Features

* The api client should have all publicly documented APIs
* Generated api client uses typescript to help with the discovery of the required arguments
  * Any untyped `attributes` that have been documented by a `description` in the swagger doc will also be included as a docblock comment when inspecting `attributes` in the editor (see `ControllerApiResourcesAccountsV1Account.attributes` in `models/ControllerApiResourcesAccountsV1Account.ts` for an example)
* Automatic resource clean up
  * Any resources created by the api client will be automatically cleaned up after the test is finished. To skip cleanup of a resource pass in the created resource to `apiClient.skipCleanup(createdResource);` (where `createdResource` has an `id` property)
* Error logging
  * When api calls fail with an http status code >= 400 the error response is logged

#### Generating the api client

The generated client is found in the `api-client` folder. Manual changes should not be made to any of the files in this folder because they will be overriden the next time the client is generated.

To regenerate the api-client run the `generate:api` package.json scripts command. By default this will use the latest swagger doc from the public [`boundary` repo](https://github.com/hashicorp/boundary) on the `main` branch at `main/internal/gen/controller.swagger.json`.
```shell
pnpm generate:api-client
```

If working on an E2E test that is working against a different version of the boundary api, ensure the updated openapi swagger doc has been generated and set `OPENAPI_SWAGGER_URL_OR_FILE` to the path or url:
```shell
# using a custom url (must be publicly accessible)
# in the following example $COMMITISH can be replaced with a branch name, commit, or tag
OPENAPI_SWAGGER_URL_OR_FILE=https://raw.githubusercontent.com/hashicorp/boundary/$COMMITISH/internal/gen/controller.swagger.json pnpm generate:api-client

# using a local absolute or relative path 
OPENAPI_SWAGGER_URL_OR_FILE=../../boundary-enterprise/internal/gen/controller.swagger.json pnpm generate:api-client
```

Consider committing any changes to the generated `api-client` directory if the changes are needed for the current e2e tests to pass.

### Testing with resources (api, page objects, cli)

When testing an E2E workflow, resources often use page objects (within `admin/pages` and `desktop/pages`) or use methods on playwright locators directly. These simulate user actions to ensure that we are testing our applications the way our users use them.

In cases where resources need to be scaffolded as a prerequisite to a test, but are not needed to be tested directly, the `apiClient` fixture should be used. This type of common setup can usually be done in `test.beforeEach` to separate it from the `test` itself. Using the `apiClient` has the added benefit of:
* being quicker to set up (api calls are faster)
* return api responses and resource definitions
* any created resource is automatically cleaned up after the test

Aside from creating resources, the `apiClient` fixture can be used in any case where interaction with the boundary api is needed.

As a last resort when page objects and the `apiClient` fixture can't be used then the boundary cli helper can be used.
