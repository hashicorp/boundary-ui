import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('can navigate via breadcrumbs to projects from project', async function (assert) {
    assert.expect(2);
    const project = this.server.create('project');
    const projectURL = `/orgs/1/projects/${project.id}`;
    await visit(projectURL);
    assert.equal(currentURL(), projectURL, 'We begin on th expected page.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), '/orgs/1/projects', 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to projects from new project', async function (assert) {
    assert.expect(2);
    const newProjectURL = `/orgs/1/projects/new`;
    await visit(newProjectURL);
    assert.equal(currentURL(), newProjectURL, 'We begin on th expected page.');
    await click(find('.rose-nav-breadcrumbs-link:first-child'));
    assert.equal(currentURL(), '/orgs/1/projects', 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to project from host catalogs', async function (assert) {
    assert.expect(2);
    const project = this.server.create('project');
    const projectURL = `/orgs/1/projects/${project.id}`;
    const hostCatalogsURL = `${projectURL}/host-catalogs`;
    await visit(hostCatalogsURL);
    assert.equal(currentURL(), hostCatalogsURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[1]);
    assert.equal(currentURL(), projectURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from host catalog', async function (assert) {
    assert.expect(2);
    const project = this.server.create('project');
    const hostCatalog = this.server.create('host-catalog');
    const projectURL = `/orgs/1/projects/${project.id}`;
    const hostCatalogsURL = `${projectURL}/host-catalogs`;
    const hostCatalogURL = `${hostCatalogsURL}/${hostCatalog.id}`;
    await visit(hostCatalogURL);
    assert.equal(currentURL(), hostCatalogURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

  test('can navigate via breadcrumbs to host catalogs from new host catalog', async function (assert) {
    assert.expect(2);
    const project = this.server.create('project');
    const projectURL = `/orgs/1/projects/${project.id}`;
    const hostCatalogsURL = `${projectURL}/host-catalogs`;
    const newHostCatalogURL = `${hostCatalogsURL}/new`;
    await visit(newHostCatalogURL);
    assert.equal(currentURL(), newHostCatalogURL, 'We begin on th expected page.');
    await click(findAll('.rose-nav-breadcrumbs-link')[2]);
    assert.equal(currentURL(), hostCatalogsURL, 'After navigating via breadcrumbs, we are one level up.');
  });

});
