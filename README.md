# Project Watchtower UI Monorepo

![Validate Monorepo](https://github.com/hashicorp/watchtower-ui/workflows/Validate%20Monorepo/badge.svg)

This monorepo contains multiple projects, including UIs and addons, used by
Project Watchtower.

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
  - [Building Core UI for Production](#building-core-ui-for-production)
    - [Building with a Container](#building-with-a-container)
  - [Committing](#committing)
    - [License Checking](#license-checking)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

You will need the following things properly installed on your computer.

* [Git][git]
* [Node.js][node]
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
* `cd watchtower-ui`
* `yarn install`

## Yarn Commands

List of available project commands.  `yarn run <command-name>`

| Command             | Description |
|---------------------|---|
| build               | Builds Core UI. |
| test                | Runs tests in CI mode. |
| commit              | Replaces `git commit`, ensures compliance, audit, lint, and test checks pass before commit is allowed and normalizes commit messages across authors. |
| lint                | Runs ember-template-lint on all of the hbs, js, and sass files. |
| compliance:audit    | Checks for issues using `yarn audit` with moderate and above criticality.|
| compliance:licenses | Checks that all dependencies have OSS-compatible licenses. |
| doc:toc             | Automatically generates a table of contents for the README file. |

## Contributing

### Branching

We follow [A Successful Git Branching Model][nvie-git], otherwise known as
Gitflow.  Branches `main` and `develop` are sacred mainlines into which we do
not commit directly.  Instead, these branches have special meaning defining what
code may be found within.  The `develop` branch contains code _for the next
release_.  Code in `main` is _released, tagged, and ready for
production deployment_.

To start contributing:
1. Start a new **topic branch** off `develop`.
2. Commit work.
3. When work is complete, create a PR from the topic branch into `develop`.
4. Code review and automated checks occur.  If checks fail or changes are
   requested, commit more work.  Rinse and repeat until all checks pass and no
   changes are requested.
5. A core team member may merge the PR into `develop`.  At this point, the code
   is unreleased but considered "releasable".
6. **Releasing**:  when it's time to release, create a PR from `develop` into
  `main` (we skip Gitflow's `release` branch).  This is tantamount to
   requesting a new release (version) of the product.  Ensure the body of the PR
   includes well-documented changes slated for release.
7. Code review and automated checks occur.
8. A core team member may merge the PR into `main` to initiate a release.
9. Tag the merge commit in `main` with version number of the release and cut
   a release in GitHub.

While Gitflow may seem heavy, most of its process can be automated.  Gitflow is
similar to its lighter-weight sibling [GitHub Flow][github-flow].  In essence,
Gitflow differs only by adding an second mainline branch (`main`) that is
designated as _always containing production code_.  Another happy characteristic
of Gitflow is that it's easy to track the project's release history, since
_every commit to `main` is a release by definition_.  The well-defined nature
of releases assists in cross-team collaboration, ensuring everyone has
confidence about the state of the project.

### Building ToC

To autogenerate a ToC (table of contents) for this README,
run `yarn doc:toc`.  Please update the ToC whenever editing the structure
of README.

### Building Core UI for Production

See ui/core/README.md Building for Production for more information on how to
build the Core UI.  Be sure to set build-related environment variables as
necessary for your target environment, as described in the Core UI readme.

To quickly produce a production build of Core UI, run from this folder:

```bash
yarn install
yarn build
```

Assets are saved to `ui/core/dist/`.

#### Building with a Container

Optionally, you may build the UI within a container.  Execute the following command:

```bash
docker-compose -f docker-compose-embedding.yml run build
```

Assets are saved to `ui/core/dist/`.

### Committing

Instead of the default `git commit`, we prescribe a custom command that ensures
linting and other checks pass before a commit may be completed.  It also ensures
that all contributors author consistent commit messages.  To get started with a
commit, stage your files as usual.  Then run `yarn commit` and follow the
on-screen instructions to author your message.

#### License Checking

The licenses of dependencies are checking against a whitelist before every
commit.  This helps catch undesirable licenses sooner (e.g. GPL).  If your
commit fails due to an non-whitelisted license, you may add it to the whitelist
in `package.json` _as long as it is not a GPL variant or UNLICENSED_.
The change will be verified upon PR.  GPL variants and UNLICENSED dependencies
will not be accepted.

[nvie-git]: https://nvie.com/posts/a-successful-git-branching-model/
[github-flow]: https://guides.github.com/introduction/flow/
