
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Admin UI e2e tests

- [Admin UI e2e tests](#admin-ui-e2e-tests)
  - [Prerequisites:](#prerequisites)
    - [Accesses](#accesses)
    - [Software](#software)
  - [Getting Started](#getting-started)
    - [Set up Boundary CLI](#set-up-boundary-cli)
    - [Setup Boundary UI](#setup-boundary-ui)
    - [Setup AWS:](#setup-aws)
    - [Setup HCP Terraform (Terraform cloud):](#setup-hcp-terraform-terraform-cloud)
    - [Setup Enos:](#setup-enos)
  - [Run tests:](#run-tests)
    - [Launch Enos Scenario](#launch-enos-scenario)
    - [Run tests](#run-tests)
    - [Destroy Enos Scenario](#destroy-enos-scenario)
  - [Developing Tests](#developing-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
# Admin UI e2e tests

This test suite tests the Boundary Admin UI in an end-to-end setting. It was designed to be run in a
variety of environments as long as the appropriate environment variables are set. You can choose to
spin up your own infrastructure or use [Enos](https://github.com/hashicorp/boundary/tree/main/enos)
to generate it for you. More information about [Enos available here.](https://github.com/hashicorp/Enos-Docs)

The test suite uses the [Playwright](https://playwright.dev/) framework.

## Prerequisites:

You will need [Homebrew](https://brew.sh/) install. For secure persisting your SSH keys and tokens we recommend using 1Password.

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
- Install AWS CLI (Optional): [documentation how to install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

## Getting Started

We will cover everything you need to set up before being able to run Enos + the tests.

### Set up Boundary CLI

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
### Setup AWS:

**Region awareness:** take note of the AWS region you are setting up because we will need it later to configure enos. [More information about AWS regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html).

**SSH Key pair:**

You need to provide an SSH Key pair for the EC2 instance. We recommend creating specific e2e SSH keys and not re-use existing ones. To differentiate them, we recommend adding `enos` to the name, i.e: `name_enos`.

[How to create EC2 SSH key pair](https://docs.aws.amazon.com/ground-station/latest/ug/create-ec2-ssh-key-pair.html).

### Setup HCP Terraform (Terraform cloud):

Log in to [HCP Production env](https://portal.cloud.hashicorp.com/). Through HCP Terraform, open Terraform cloud, or [access here](https://app.terraform.io/). Then create an API token [following this documentation](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/users#tokens).

**Token awareness:** Copy your token from the box and save it in a secure location. Terraform Cloud only displays the token once, right after you create it. And we will need the token later for enos configuration.

### Setup Enos:

Enos needs some configuration variables to run the scenario successfully. [See the configuration file](https://github.com/hashicorp/boundary/blob/main/enos/enos.vars.hcl). The file has comments per each variable, but some awareness:

- `aws_region`: The AWS region you are using. Very important as mentioned within the EC2 Setup.
- `aws_ssh_keypair_name`: The name of the AWS keypair.
- `aws_ssh_private_key_path`: The path to the private key associated with your keypair.
- `enos_user`: The user name to use for Boundary.
- `tfc_api_token`: you need to provide the previously created token in Terraform cloud, there is no shared token within Boundary team.
- `local_boundary_dir`: The directory that contains Boundary binary.
- `local_boundary_ui_dir`: The directory that contains the copy of boundary-ui you want to use for UI tests.
- `e2e_debug_no_run`: make sure this is set to true.

More documentation about [scenario variables](https://github.com/hashicorp/boundary/tree/main/enos#scenarios-variables).

## Run tests:

Before running the e2e test locally, we need to launch Enos Scenario, make sure you followed all the steps within the [Getting started section](#getting-started).

It is not necessary, but from this point we recommend having 2 terminals open. 
- Terminal 1: Will be use to run enos (Boundary).
- Terminal 2: Will be use to run e2e UI tests (Boundary UI).

### Launch Enos Scenario

Using Terminal 1: 
- `$ cd boundary/enos`.
- `$ doormat login`. Login with Doormat.
- `$ eval "$(doormat aws export --account boundary_team_acctest_dev)"`. Exporting AWS env variables from doormat to your terminal.
- `$ enos scenario launch e2e_ui builder:local`. Launch enos scenario, this will take from 5 to 10 minutes. When its done, you will see a Enos Operations finished! within your terminal.
- `$ bash scripts/test_e2e_env.sh`. Prints all the env variables within Enos scenario. Copy the output and paste it within your Terminal 2 (Boundary UI). These env variables are need within Boundary UI to run the test against the enos scenario.

*Be aware once the scenario is launch you will create and run resources within AWS, once you are done using the scenario, [you should destroy it](#destroy-enos-scenario).*

### Run tests

Using Terminal 2:
- Set the env varibales `test_e2e_env.sh` script output within this terminal.
- `$ cd boundary-ui/ui/admin`.
- `$ yarn run e2e`.

Here are some additional commands to assist with debugging.
```bash
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js:13 --debug
PWDEBUG=console yarn playwright test --headed --config ./tests/e2e/playwright.config.js login.spec.js --debug
```

[Playwright documentation about running tests](https://playwright.dev/docs/running-tests).

### Destroy Enos Scenario

Using Terminal 1:
- `$ enos scenario destroy e2e_ui builder:local`
- After all the steps pass, you should see a `Enos operations finished!`.



## Developing Tests

It is recommended to use locators that resemble how users interact with the application. `getByRole`
should be the most prioritized locator as this is the closest way to how users and
accessibility features perceive the page. `getByLabel` should be used for form fields.

Additional information can be found [here](https://playwright.dev/docs/locators#locating-elements)
and [here](https://testing-library.com/docs/queries/about/#priority).
