import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let org;
  let project;
  let hostCatalog;
  let projectsURL;
  let newProjectURL;
  let projectURL;
  let hostCatalogsURL;
  let newHostCatalogURL;
  let hostCatalogURL;

  let crumbPath;

  hooks.beforeEach(function () {
    org = this.server.create('org');
    project = this.server.create('project');
    hostCatalog = this.server.create('host-catalog');
    projectsURL = `/orgs/${org.id}/projects`;
    newProjectURL = `${projectsURL}/new`;
    projectURL = `${projectsURL}/${project.id}`;
    hostCatalogsURL = `${projectURL}/host-catalogs`;
    newHostCatalogURL = `${hostCatalogsURL}/new`;
    hostCatalogURL = `${hostCatalogsURL}/${hostCatalog.id}`;
    authenticateSession();
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

});
