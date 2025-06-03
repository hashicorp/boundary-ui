# Boundary UI Monorepo
![](boundary.png)

![Validate Monorepo](https://github.com/hashicorp/boundary-ui/workflows/Validate%20Monorepo/badge.svg)

This monorepo contains multiple projects, including UIs and addons, used by
Boundary.

This top-level repository provides limited common tasks, such as installation
and commit assistance.  However, most tasks must be executed from within a
subproject, e.g. running or testing.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Boundary UI Monorepo](#boundary-ui-monorepo)
  - [Projects](#projects)
    - [Core (addons/core):](#core-addonscore)
    - [API (addons/api):](#api-addonsapi)
    - [Auth (addons/auth):](#auth-addonsauth)
    - [Rose (addons/rose)](#rose-addonsrose)
    - [Admin (ui/admin)](#admin-uiadmin)
    - [Desktop Client (ui/desktop)](#desktop-client-uidesktop)
  - [Prerequisites](#prerequisites)
  - [Optional Tooling](#optional-tooling)
  - [Installation](#installation)
  - [Pnpm Commands](#pnpm-commands)
  - [Contributing](#contributing)
    - [Branching](#branching)
    - [Building ToC](#building-toc)
    - [Building Admin UI for Production](#building-admin-ui-for-production)
      - [Building with a Container](#building-with-a-container)
    - [Building Desktop UI for Production](#building-desktop-ui-for-production)
    - [Connect Boundary UI to Boundary local instance](#connect-boundary-ui-to-boundary-local-instance)
      - [For Admin](#for-admin)
      - [For Desktop](#for-desktop)
    - [Committing](#committing)
      - [License Checking](#license-checking)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Projects

This monorepo contains multiple projects.
### Core (addons/core):
Core features use by Boundary UI's, i.e i18n, helpers or components. [Project Readme](addons/core).

### API (addons/api):
The API data access layer for Boundary and all the related mocks. [Project Readme](addons/api).

### Auth (addons/auth):
Authentication layer for Boundary. [Project Readme](addons/auth).

### Rose (addons/rose)
Common styles and components shared by Boundary UIs. [Project Readme](addons/rose).

### Admin (ui/admin)
The Admin UI for Boundary. [Project Readme](ui/admin).

### Desktop Client (ui/desktop)
The desktop client UI for Boundary. [Project Readme](ui/desktop).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git][git]
* [Node.js][node]
  * Supported versions: `v20` and `v22`.
* [Pnpm][pnpm] installed globally
* [Google Chrome][chrome]
* [Firefox][firefox]


## Optional Tooling

Our team finds the following applications useful in day-to-day development
workflows.  These are merely recommendations.  We encourage you to use the tools
that best suit you and your personal style.

* [VS Code][vscode]: Code editor for building and debugging web applications
* [Warp][warp]:  Terminal application for macOS
* [Homebrew][homebrew]:  The missing package manager for macOS and Linux
* [Ember Inspector][ember-inspector]:  Understand and debug Ember applications
* [Postman][postman]:  Test and inspect APIs


## Installation

* `git clone <repository-url>` this repository
* `cd boundary-ui`
* `pnpm install`

## Pnpm Commands

List of available project commands.  `pnpm run <command-name>`

| Command             | Description |
|---------------------|---|
| build               | Builds Admin UI for production. |
| test                | Runs tests in CI mode. |
| lint                | Runs ember-template-lint on all of the hbs, js, and sass files. |
| compliance:audit    | Checks for issues using `pnpm audit` with moderate and above criticality.|
| compliance:licenses | Checks that all dependencies have OSS-compatible licenses. |
| doc:toc             | Automatically generates a table of contents for the README file. |

## Contributing

### Branching

We follow [GitHub Flow][github-flow].

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `pnpm doc:toc`.  Please update the ToC whenever editing the structure
of README.

### Building Admin UI for Production

See [Admin UI README](ui/admin/README.md#building-for-production) for more information on how to
build the Admin UI for production.  Be sure to set build-related environment variables as
necessary for your target environment, as described in the [Environment Variables](ui/admin/README.md#environment-variables) section of README.

To quickly produce a production build of Admin UI, run from this folder:

```bash
pnpm install
pnpm build
```

Assets are saved to `ui/admin/dist/`.

#### Building with a Container

Optionally, you may build the UI within a container.  Execute the following command:

```bash
docker-compose -f docker-compose-embedding.yml run build
```

Assets are saved to `ui/admin/dist/`.

### Building Desktop UI for Production

See [Desktop UI README](ui/desktop/README.md#building-for-production) for more information on how to
build the Desktop UI.  Be sure to set build-related environment variables as
necessary for your target environment, as described in the [Environment Variables](ui/desktop/README.md#environment-variables-prod) section of README.

To quickly produce a production build of Desktop UI, run from this folder:

```bash
pnpm install
pnpm build:ui:desktop
```

In windows, UI is generated using docker to provide a stable UI across platforms.

```cmd
pnpm install
docker-compose -f docker-compose-embedding.yml run build-desktop-production
pnpm build:ui:desktop:app
```

To provide a signing identify for macOS build, use `BOUNDARY_DESKTOP_SIGNING_IDENTITY`
environment variable to set signing certificate name (e.g Developer ID Application: * (*)) when building desktop app using `pnpm build:ui:desktop:app`.

Assets are saved to `ui/desktop/electron-app/out/make/`.
DMG packaged desktop UI is available at asset location as `boundary.dmg`.
EXE archived desktop UI is available at asset location under `zip` folder.

### Connect Boundary UI to Boundary local instance

This describes how to connect local Boundary UI to your local instance of Boundary.

This assumes you already have up and running a Boundary dev instance in your local environment with a listener `127.0.0.1:9200` (default behaviour). [Learn how to start a local Boundary dev instance](https://developer.hashicorp.com/boundary/tutorials/get-started-community/community-get-started-dev)

#### For Admin

This assumes you are within `boundary-ui/ui/admin`.

You will need to turn `off` mirage, tell the UI where to find Boundary and run it: `$ ENABLE_MIRAGE=false API_HOST=http://localhost:9200 pnpm start`.

Following terminal instructions, open in your browser: `http://localhost:4200/`.

Once you open the UI you will see the login screen, authenticate using generated admin login name and password.

#### For Desktop

This assumes you are within `boundary-ui/ui/desktop`.

You will need to turn `off` mirage and run it: `$ ENABLE_MIRAGE=false pnpm start:desktop`.

In login screen, authenticate using generated admin login name and password.

Enter the cluster URL of your Boundary dev instance, by default is: `http://localhost:9200`.

### Committing

We use `husky` and `lint-staged` to ensure linting and other checks pass before a
commit is completed. Simply do a `pnpm install` to make sure the hooks are installed.

Use a normal `git commit` to go through the checks, if you need to skip these checks,
use `git commit --no-verify` to bypass them. However, a consistent commit message will
still be enforced even if you use `--no-verify`.

#### License Checking

The licenses of dependencies are checking against an allowlist before every
commit.  This helps catch undesirable licenses sooner (e.g. GPL).  If your
commit fails due to a non-allowlisted license, you may add it to the allowlist
in `package.json` _as long as it is not a GPL variant or UNLICENSED_.
The change will be verified upon PR.  GPL variants and UNLICENSED dependencies
will not be accepted.

[github-flow]: https://guides.github.com/introduction/flow/

[git]: https://git-scm.com/
[node]: https://nodejs.org/
[pnpm]: https://pnpm.io
[chrome]: https://google.com/chrome/
[firefox]: https://firefox.com/
[pnpm-workspaces]: https://pnpm.io/workspaces
[homebrew]: https://brew.sh
[warp]: https://www.warp.dev
[vscode]: https://code.visualstudio.com/
[ember-inspector]: https://guides.emberjs.com/release/ember-inspector/
[postman]: https://www.postman.com/downloads/
