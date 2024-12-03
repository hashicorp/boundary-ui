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
    - [Launch Enos Scenario](#launch-enos-scenario)
    - [Admin](#admin)
    - [Desktop](#desktop)
    - [Destroy Enos Scenario](#destroy-enos-scenario)
  - [Developing Tests](#developing-tests)

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
yarn install
npx playwright install # this installs the browsers used by Playwright
```

### Setup AWS:

**Region awareness:** take note of the AWS region you are setting up because we will need it later to configure enos. [More information about AWS regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html).

**SSH Key pair:**

You need to provide an SSH Key pair for the EC2 instance. We recommend creating specific e2e SSH keys and not re-use existing ones. To differentiate them, we recommend adding `enos` to the name, i.e: `name_enos`.

[How to create EC2 SSH key pair](https://docs.aws.amazon.com/ground-station/latest/ug/create-ec2-ssh-key-pair.html).

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

More documentation about [scenario variables](https://github.com/hashicorp/boundary/tree/main/enos#scenarios-variables).

## Run tests:

Before running the e2e test locally, we need to launch an Enos Scenario. Make sure you followed all the steps within the [Getting started section](#getting-started).

It is not necessary, but from this point we recommend having 2 terminals open.

- Terminal 1: Will be use to run enos (Boundary).
- Terminal 2: Will be use to run e2e UI tests (Boundary UI).

### Launch Enos Scenario

Using Terminal 1:

- `cd boundary/enos` or `cd boundary_enterprise/enos`.
- `doormat login`. Login with Doormat.
- `eval "$(doormat aws export --account boundary_team_acctest_dev)"`. Exporting AWS env variables from doormat to your terminal.
- `enos scenario launch e2e_ui_aws builder:local` or `enos scenario launch e2e_ui_aws_ent builder:local` if in enterprise.
  - Launches enos scenario, this will take from 5 to 10 minutes. When its done, you will see a Enos Operations finished! within your terminal. Check out more scenarios [here](https://github.com/hashicorp/boundary/tree/main/enos).
- `bash scripts/test_e2e_env.sh`. Prints all the env variables within Enos scenario. Copy the output and paste it within your Terminal 2 (Boundary UI). These env variables are need within Boundary UI to run the test against the enos scenario.

> [!IMPORTANT]
> Be aware that once the scenario is launched you will create and run resources within AWS. After you are done using the scenario, [you should destroy it](#destroy-enos-scenario).

### Admin

Using Terminal 2:

Set the env variables `test_e2e_env.sh` script output in this terminal.

```bash
cd boundary-ui/e2e-tests
yarn run admin
```

Here are some additional commands to assist with debugging.

```bash
PWDEBUG=console yarn playwright test --headed --config admin/playwright.config.js login.spec.js
PWDEBUG=console yarn playwright test --headed --config admin/playwright.config.js login.spec.js:13 --debug
PWDEBUG=console yarn playwright test --headed --config admin/playwright.config.js login.spec.js --debug
```

To run all tests for a certain configuration, you can use the following shortcuts

```bash
# Runs all tests pertaining to the Community Edition
yarn run e2e:ce:aws
yarn run e2e:ce:docker

# Runs all tests pertaining to the Enterprise Edition
yarn run e2e:ent:aws
yarn run e2e:ent:docker
```

### Desktop

> [!NOTE]
> Currently the desktop client e2e tests assumes that the Boundary server is an enterprise edition.

Using Terminal 2:

Set the env variables `test_e2e_env.sh` script output in this terminal.

```bash
cd boundary-ui/e2e-tests
yarn run desktop
```

[Playwright documentation about running tests](https://playwright.dev/docs/running-tests).

### Destroy Enos Scenario

Using Terminal 1:

```bash
# Community Edition
enos scenario destroy e2e_ui_aws builder:local

# Enterprise Edition
enos scenario destroy e2e_ui_aws_ent builder:local
```

After all the steps pass, you should see a `Enos operations finished!`.

## Developing Tests

It is recommended to use locators that resemble how users interact with the application. `getByRole`
should be the most prioritized locator as this is the closest way to how users and
accessibility features perceive the page. `getByLabel` should be used for form fields.

Additional information can be found [here](https://playwright.dev/docs/locators#locating-elements)
and [here](https://testing-library.com/docs/queries/about/#priority).
