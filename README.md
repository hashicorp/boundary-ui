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
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Yarn Commands](#yarn-commands)
- [Contributing](#contributing)
  - [Branching](#branching)
  - [Building ToC](#building-toc)
  - [Building Admin UI for Production](#building-admin-ui-for-production)
    - [Building with a Container](#building-with-a-container)
  - [Building Desktop UI for Production](#building-desktop-ui-for-production)
  - [Connect Boundary UI to Boundary local instance](#connect-boundary-ui-to-boundary-local-instance)
    - [For admin](#for-admin)
    - [For desktop](#for-desktop)
  - [Committing](#committing)
    - [License Checking](#license-checking)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

You will need the following things properly installed on your computer.

* [Git][git]
* [Node.js][node]
  * v10–v15
  * **Apple Silicon Users**:  if you experience problems building or running
    Boundary UIs, try Node v15.
* [Yarn][yarn] installed globally
* [Google Chrome][chrome]
* [Firefox][firefox]

[git]: https://git-scm.com/
[node]: https://nodejs.org/
[yarn]: https://classic.yarnpkg.com/lang/en/
[chrome]: https://google.com/chrome/
[firefox]: https://firefox.com/
[yarn-workspaces]: https://classic.yarnpkg.com/en/docs/workspaces/

## Installation

* `git clone <repository-url>` this repository
* `cd boundary-ui`
* `yarn install`

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command             | Description |
|---------------------|---|
| build               | Builds Admin UI. |
| test                | Runs tests in CI mode. |
| commit              | Replaces `git commit`, ensures compliance, audit, lint, and test checks pass before commit is allowed and normalizes commit messages across authors. |
| lint                | Runs ember-template-lint on all of the hbs, js, and sass files. |
| compliance:audit    | Checks for issues using `yarn audit` with moderate and above criticality.|
| compliance:licenses | Checks that all dependencies have OSS-compatible licenses. |
| doc:toc             | Automatically generates a table of contents for the README file. |

## Contributing

### Branching

We follow [GitHub Flow][github-flow].

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `yarn doc:toc`.  Please update the ToC whenever editing the structure
of README.

### Building Admin UI for Production

See ui/admin/README.md Building for Production for more information on how to
build the Admin UI.  Be sure to set build-related environment variables as
necessary for your target environment, as described in the Admin UI readme.

To quickly produce a production build of Admin UI, run from this folder:

```bash
yarn install
yarn build
```

Assets are saved to `ui/admin/dist/`.

#### Building with a Container

Optionally, you may build the UI within a container.  Execute the following command:

```bash
docker-compose -f docker-compose-embedding.yml run build
```

Assets are saved to `ui/admin/dist/`.

### Building Desktop UI for Production

See ui/desktop/README.md Building for Production for more information on how to
build the Desktop UI.  Be sure to set build-related environment variables as
necessary for your target environment, as described in the Desktop UI readme.

To quickly produce a production build of Desktop UI, run from this folder:

```bash
yarn install
yarn build:ui:desktop
```

To provide a signing identify for macOS build, use `BOUNDARY_DESKTOP_SIGNING_IDENTITY`
environment variable to set signing certificate name (e.g Developer ID Application: * (*)).

Assets are saved to `ui/desktop/electron-app/out/make/`.
DMG packaged desktop UI is available at asset location as `boundary.dmg`.

### Connect Boundary UI to Boundary local instance

This describes how to connect local Boundary UI to your local instance of Boundary.

This assumes you already have up and running a boundary instance in your local environment with a listener `127.0.0.1:9200` (default behaviour). If you do not have it, please [follow Boundary documentation](https://github.com/hashicorp/boundary#build-and-start-boundary-in-dev-mode) for it.
#### For admin

This assumes you are within `boundary-ui/ui/admin`.

You will need to turn `off` mirage, tell the UI where to find Boundary and run it: `$ ENABLE_MIRAGE=false API_HOST=http://localhost:9200 yarn start`.

Following terminal instructions, open in your browser: `http://localhost:4200/`.

Once you open the UI you will see the login screen.

By default, for development purposes, credentials are:
- Login name: `admin`.
- Password: `password`

*Be aware these are default credentials, if you change them in Boundary, use the ones you set before*
#### For desktop

This assumes you are within `boundary-ui/ui/desktop`.

You will need to turn `off` mirage and run it: `$ ENABLE_MIRAGE=false yarn start:desktop`.

You will see the login screen.

Make sure the origin URL is pointing `http://localhost:9200`.

By default, for development purposes, credentials are:
- Login name: `admin`.
- Password: `password`

*Be aware these are default credentials, if you change them in Boundary, use the ones you set before*

### Committing

Instead of the default `git commit`, we prescribe a custom command that ensures
linting and other checks pass before a commit may be completed.  It also ensures
that all contributors author consistent commit messages.  To get started with a
commit, stage your files as usual.  Then run `yarn commit` and follow the
on-screen instructions to author your message.

#### License Checking

The licenses of dependencies are checking against an allowlist before every
commit.  This helps catch undesirable licenses sooner (e.g. GPL).  If your
commit fails due to a non-allowlisted license, you may add it to the allowlist
in `package.json` _as long as it is not a GPL variant or UNLICENSED_.
The change will be verified upon PR.  GPL variants and UNLICENSED dependencies
will not be accepted.

[github-flow]: https://guides.github.com/introduction/flow/
