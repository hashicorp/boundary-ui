import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let org;
  let project;
  let user;
  let hostCatalog;
  let projectsURL;
  let newProjectURL;
  let projectURL;
  let hostCatalogsURL;
  let newHostCatalogURL;
  let hostCatalogURL;
  let usersURL;
  let newUserURL;
  let userURL;

  let crumbPath;

  hooks.beforeEach(function () {
    org = this.server.create('org');
    project = this.server.create('project');
    user = this.server.create('user');

    hostCatalog = this.server.create('host-catalog');
    projectsURL = `/orgs/${org.id}/projects`;
    newProjectURL = `${projectsURL}/new`;
    projectURL = `${projectsURL}/${project.id}`;
    hostCatalogsURL = `${projectURL}/host-catalogs`;
    newHostCatalogURL = `${hostCatalogsURL}/new`;
    hostCatalogURL = `${hostCatalogsURL}/${hostCatalog.id}`;

    // Users
    usersURL = `/orgs/${org.id}/users`;
    newUserURL = `${usersURL}/${user.id}`;
    userURL = `${usersURL}/new`;
  });

  test('can navigate via breadcrumbs to projects from project', async function (assert) {
    assert.expect(3);
    await visit(projectURL);
    assert.equal(currentURL(), projectURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, projectURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), projectsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to projects from new project', async function (assert) {
    assert.expect(3);
    await visit(newProjectURL);
    assert.equal(currentURL(), newProjectURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, newProjectURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), projectsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to project from host catalogs', async function (assert) {
    assert.expect(3);
    await visit(hostCatalogsURL);
    assert.equal(currentURL(), hostCatalogsURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, hostCatalogsURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[1]);
    assert.equal(currentURL(), projectURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from host catalog', async function (assert) {
    assert.expect(3);
    await visit(hostCatalogURL);
    assert.equal(currentURL(), hostCatalogURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, hostCatalogURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from new host catalog', async function (assert) {
    assert.expect(3);
    await visit(newHostCatalogURL);
    assert.equal(currentURL(), newHostCatalogURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, newHostCatalogURL, 'Last crumb has expected URL.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to users from user', async function (assert) {
    assert.expect(3);
    await visit(userURL);
    assert.equal(currentURL(), userURL, 'We begin on the expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, userURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), usersURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to users from new user', async function (assert) {
    assert.expect(3);
    await visit(newUserURL);
    assert.equal(currentURL(), newUserURL, 'We begin on th expected page.');
    crumbPath = new URL(find('.rose-nav-breadcrumbs-link:last-child').href).pathname;
    assert.equal(crumbPath, newUserURL, 'Last crumb has expected URL.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), usersURL, 'After navigating via breadcrumbs, we are one level up.');
  });
});
