import { module, test } from 'qunit';
import { visit, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-scope-results]';
  const SCOPE_LINK_SELECTOR = (id) =>
    `tbody [data-test-scopes-table-row="${id}"] a`;

  const instances = {
    scopes: {
      global: null,
      org1: null,
      org2: null,
      project1: null,
      project2: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org1 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project1 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org1.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org1.id, type: 'org' },
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org1.id}/scopes`;
    authenticateSession({});
  });

  test('user can search for a specifc org scope by id', async function (assert) {
    await visit(urls.globalScope);

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org1.id)).exists();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org2.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.scopes.org1.id);
    await waitFor(SCOPE_LINK_SELECTOR(instances.scopes.org2.id), { count: 0 });

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org1.id)).exists();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org2.id)).doesNotExist();
  });

  test('user can search for org scopes and get no results', async function (assert) {
    await visit(urls.globalScope);

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org1.id)).exists();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org2.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake org scope that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org1.id)).doesNotExist();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.org2.id)).doesNotExist();
  });

  test('user can search for a specifc project scope by id', async function (assert) {
    await visit(urls.orgScope);

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.project1.id)).exists();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.project2.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.scopes.project1.id);
    await waitFor(SCOPE_LINK_SELECTOR(instances.scopes.project2.id), {
      count: 0,
    });

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.project1.id)).exists();
    assert
      .dom(SCOPE_LINK_SELECTOR(instances.scopes.project2.id))
      .doesNotExist();
  });

  test('user can search for project scopes and get no results', async function (assert) {
    await visit(urls.orgScope);

    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.project1.id)).exists();
    assert.dom(SCOPE_LINK_SELECTOR(instances.scopes.project2.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake org scope that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert
      .dom(SCOPE_LINK_SELECTOR(instances.scopes.project1.id))
      .doesNotExist();
    assert
      .dom(SCOPE_LINK_SELECTOR(instances.scopes.project2.id))
      .doesNotExist();
  });
});
