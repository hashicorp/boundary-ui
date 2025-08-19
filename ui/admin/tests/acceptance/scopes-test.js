/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let getScopeCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      org2: null,
      project: null,
      project2: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopes: null,
    newOrgScope: null,
    org2Scope: null,
    org2Scopes: null,
    orgScopeEdit: null,
    org2ScopeEdit: null,
    projectScope: null,
    newProjectScope: null,
    project2Scope: null,
    projectTargets: null,
    project2Targets: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.newOrgScope = `${urls.globalScope}/new`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.orgScopes = `${urls.orgScope}/scopes`;
    urls.org2Scope = `/scopes/${instances.scopes.org2.id}`;
    urls.org2Scopes = `${urls.org2Scope}/scopes`;
    urls.orgScopeEdit = `${urls.orgScope}/edit`;
    urls.org2ScopeEdit = `${urls.org2Scope}/edit`;
    urls.newProjectScope = `${urls.orgScopes}/new`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.project2Scope = `/scopes/${instances.scopes.project2.id}`;
    urls.projectTargets = `${urls.projectScope}/targets`;
    urls.project2Targets = `${urls.project2Scope}/targets`;
    // Generate resource counter
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    await authenticateSession({ isGlobal: true, username: 'admin' });
  });

  test('visiting global scope', async function (assert) {
    await visit(urls.globalScope);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalScope);
  });

  // TODO: this probably shouldn't be the case, but was setup to enable
  // authentication when the global scope couldn't be loaded.
  // In order to resolve this, we might hoist authentication routes up from
  // under scopes.
  test('visiting global scope is successful even when the global scope cannot be fetched', async function (assert) {
    this.server.get('/scopes/:id', ({ scopes }, { params: { id } }) => {
      const scope = scopes.find(id);
      const response = id === 'global' ? new Response(404) : scope;
      return response;
    });
    await visit(urls.globalScope);

    assert.strictEqual(currentURL(), urls.globalScope);
  });

  test('visiting org scope', async function (assert) {
    assert.true(false);
    await visit(urls.orgScopes);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgScopes);
  });

  test('can navigate among org scopes via side-nav', async function (assert) {
    await visit(urls.globalScope);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalScope);

    await click(commonSelectors.SIDEBAR_SCOPE_DROPDOWN);
    await click(commonSelectors.SIDEBAR_SCOPE_LINK(urls.orgScope));
    assert.strictEqual(currentURL(), urls.orgScopes);

    await click(commonSelectors.SIDEBAR_SCOPE_DROPDOWN);
    await click(commonSelectors.SIDEBAR_SCOPE_LINK(urls.org2Scope));

    assert.strictEqual(currentURL(), urls.org2Scopes);
  });

  test('can navigate among project scopes via side-nav', async function (assert) {
    await visit(urls.projectScope);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.projectTargets);

    await click(commonSelectors.SIDEBAR_SCOPE_DROPDOWN);
    await click(commonSelectors.SIDEBAR_SCOPE_LINK(urls.project2Scope));

    assert.strictEqual(currentURL(), urls.project2Targets);
  });

  test('can create new org scopes', async function (assert) {
    const orgScopeCount = getScopeCount('org');
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.newOrgScope));
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getScopeCount('org'), orgScopeCount + 1);
  });

  test('can create new project scopes', async function (assert) {
    const orgScopeCount = getScopeCount('project');
    await visit(urls.orgScopes);

    await click(commonSelectors.HREF(urls.newProjectScope));
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getScopeCount('project'), orgScopeCount + 1);
  });

  test('can cancel create new org scopes', async function (assert) {
    const orgScopeCount = getScopeCount('org');
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.newOrgScope));
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.strictEqual(getScopeCount('org'), orgScopeCount);
  });

  test('can cancel create new project scopes', async function (assert) {
    const projectScopeCount = getScopeCount('project');
    await visit(urls.orgScopes);

    await click(commonSelectors.HREF(urls.newProjectScope));
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.orgScopes);
    assert.strictEqual(getScopeCount('project'), projectScopeCount);
  });

  test('saving a new scope with invalid fields displays error messages', async function (assert) {
    this.server.post('/scopes', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.newOrgScope));
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_ERROR).hasText('Name is required.');
  });
});
