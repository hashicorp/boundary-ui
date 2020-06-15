import { module, test } from 'qunit';
import { visit, currentURL, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | breadcrumbs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting projects', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    await visit('/orgs/1/projects');
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 1);
    await click('.rose-nav-breadcrumbs a');
    assert.equal(currentURL(), '/orgs/1/projects');
  });

  test('visiting project', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    const projectURL = `/orgs/1/projects/${this.server.db.projects[0].id}`;
    await visit(projectURL);
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 2);

    await visit(projectURL);
    await click(findAll('.rose-nav-breadcrumbs a')[1]);
    assert.equal(currentURL(), projectURL);
  });

  test('visiting project creation', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    const projectURL = '/orgs/1/projects/new';
    await visit(projectURL);
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 2);

    await visit(projectURL);
    await click(findAll('.rose-nav-breadcrumbs a')[1]);
    assert.equal(currentURL(), projectURL);
  });

  test('visiting host catalogs', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    const hostcatalogsURL = `/orgs/1/projects/${this.server.db.projects[0].id}/host-catalogs`;
    await visit(hostcatalogsURL);
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 3);

    await visit(hostcatalogsURL);
    await click(findAll('.rose-nav-breadcrumbs a')[2]);
    assert.equal(currentURL(), hostcatalogsURL);
  });

  test('visiting host catalog', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    const hostcatalogURL = `/orgs/1/projects/${this.server.db.projects[0].id}/host-catalogs/${this.server.db.hostCatalogs[0].id}`;
    await visit(hostcatalogURL);
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 4);

    await visit(hostcatalogURL);
    await click(findAll('.rose-nav-breadcrumbs a')[3]);
    assert.equal(currentURL(), hostcatalogURL);
  });

  test('visiting host catalog creation', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    const hostcatalogURL = `/orgs/1/projects/${this.server.db.projects[0].id}/host-catalogs/new`;
    await visit(hostcatalogURL);
    assert.equal(findAll('.rose-nav-breadcrumbs a').length, 4);

    await visit(hostcatalogURL);
    await click(findAll('.rose-nav-breadcrumbs a')[3]);
    assert.equal(currentURL(), hostcatalogURL);
  });
});
