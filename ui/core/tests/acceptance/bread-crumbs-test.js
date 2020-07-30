import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let getProjectScope;
  let project;
  let hostCatalog;
  let user;
  let role;
  let group;
  let projectsURL, projectURL, newProjectURL;
  let hostCatalogsURL, hostCatalogURL, newHostCatalogURL;
  let usersURL, userURL, newUserURL;
  let rolesURL, roleURL, newRoleURL;
  let groupsURL, groupURL, newGroupURL;

  let crumbPath;

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
      },
      'withChildren'
    );

    getProjectScope = () =>
      this.server.schema.scopes.where({ type: 'project' }).models[0];

    project = getProjectScope();
    user = this.server.create('user');
    role = this.server.create('role');
    group = this.server.create('group');

    projectsURL = `/scopes/${orgScope.id}/projects`;
    newProjectURL = `${projectsURL}/new`;
    projectURL = `${projectsURL}/${project.id}`;

    rolesURL = `/scopes/${orgScope.id}/roles`;
    newRoleURL = `${rolesURL}/new`;
    roleURL = `${rolesURL}/${role.id}`;

    groupsURL = `/scopes/${orgScope.id}/groups`;
    newGroupURL = `${groupsURL}/new`;
    groupURL = `${groupsURL}/${group.id}`;

    usersURL = `/scopes/${orgScope.id}/users`;
    newUserURL = `${usersURL}/${user.id}`;
    userURL = `${usersURL}/new`;

    // TODO: Update hostcatalog to scopes
    hostCatalog = this.server.create('host-catalog');
    hostCatalogsURL = `${projectURL}/host-catalogs`;
    newHostCatalogURL = `${hostCatalogsURL}/new`;
    hostCatalogURL = `${hostCatalogsURL}/${hostCatalog.id}`;
  });

  test('can navigate via breadcrumbs to projects from project', async function (assert) {
    assert.expect(3);
    await visit(projectURL);
    assert.equal(currentURL(), projectURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, projectURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      projectsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to projects from new project', async function (assert) {
    assert.expect(3);
    await visit(newProjectURL);
    assert.equal(currentURL(), newProjectURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, newProjectURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      projectsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to project from host catalogs', async function (assert) {
    assert.expect(3);
    await visit(hostCatalogsURL);
    assert.equal(
      currentURL(),
      hostCatalogsURL,
      'We begin on the expected page.'
    );
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, hostCatalogsURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[1]);
    assert.equal(
      currentURL(),
      projectURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to host catalogs from host catalog', async function (assert) {
    assert.expect(3);
    await visit(hostCatalogURL);
    assert.equal(
      currentURL(),
      hostCatalogURL,
      'We begin on the expected page.'
    );
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, hostCatalogURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(
      currentURL(),
      hostCatalogsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to host catalogs from new host catalog', async function (assert) {
    assert.expect(3);
    await visit(newHostCatalogURL);
    assert.equal(
      currentURL(),
      newHostCatalogURL,
      'We begin on the expected page.'
    );
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, newHostCatalogURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(
      currentURL(),
      hostCatalogsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to roles from role', async function (assert) {
    assert.expect(3);
    await visit(roleURL);
    assert.equal(currentURL(), roleURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, roleURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      rolesURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to roles from new role', async function (assert) {
    assert.expect(3);
    await visit(newRoleURL);
    assert.equal(currentURL(), newRoleURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, newRoleURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      rolesURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to groups from group', async function (assert) {
    assert.expect(3);
    await visit(groupURL);
    assert.equal(currentURL(), groupURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, groupURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      groupsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to groups from new group', async function (assert) {
    assert.expect(3);
    await visit(newGroupURL);
    assert.equal(currentURL(), newGroupURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, newGroupURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      groupsURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to users from user', async function (assert) {
    assert.expect(3);
    await visit(userURL);
    assert.equal(currentURL(), userURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, userURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      usersURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });

  test('can navigate via breadcrumbs to users from new user', async function (assert) {
    assert.expect(3);
    await visit(newUserURL);
    assert.equal(currentURL(), newUserURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href)
      .pathname;
    assert.equal(crumbPath, newUserURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(
      currentURL(),
      usersURL,
      'After navigating via breadcrumbs, we are one level up.'
    );
  });
});
