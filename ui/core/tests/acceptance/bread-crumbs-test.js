import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let project;
  let hostCatalog;
  let projectsURL;
  let newProjectURL;
  let projectURL;
  let hostCatalogsURL;
  let newHostCatalogURL;
  let hostCatalogURL;

  hooks.beforeEach(function () {
    project = this.server.create('project');
    hostCatalog = this.server.create('host-catalog');
    projectsURL = `/orgs/1/projects`;
    newProjectURL = `${projectsURL}/new`;
    projectURL = `${projectsURL}/${project.id}`;
    hostCatalogsURL = `${projectURL}/host-catalogs`;
    newHostCatalogURL = `${hostCatalogsURL}/new`;
    hostCatalogURL = `${hostCatalogsURL}/${hostCatalog.id}`;
  });

  test('can navigate via breadcrumbs to projects from project', async function (assert) {
    assert.expect(2);
    await visit(projectURL);
    assert.equal(currentURL(), projectURL, 'We begin on th expected page.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), '/orgs/1/projects', 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to projects from new project', async function (assert) {
    assert.expect(2);
    await visit(newProjectURL);
    assert.equal(currentURL(), newProjectURL, 'We begin on th expected page.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), '/orgs/1/projects', 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to project from host catalogs', async function (assert) {
    assert.expect(2);
    await visit(hostCatalogsURL);
    assert.equal(currentURL(), hostCatalogsURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[1]);
    assert.equal(currentURL(), projectURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from host catalog', async function (assert) {
    assert.expect(2);
    await visit(hostCatalogURL);
    assert.equal(currentURL(), hostCatalogURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from new host catalog', async function (assert) {
    assert.expect(2);
    await visit(newHostCatalogURL);
    assert.equal(currentURL(), newHostCatalogURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

});
