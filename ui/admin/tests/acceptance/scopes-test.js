/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const ORG_SCOPES_DROPDOWN_SELECTOR = (url) =>
    `.rose-header-nav .rose-dropdown [href="${url}"]`;
  const PROJECT_SCOPES_DROPDOWN_SELECTOR = (url) =>
    `.rose-header-nav .rose-dropdown + .rose-dropdown [href="${url}"]`;
  const SAVE_BUTTON_SELECTOR = '[type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';

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
    projectScopeEdit: null,
    project2ScopeEdit: null,
  };

  hooks.beforeEach(function () {
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
    urls.projectScopeEdit = `${urls.projectScope}/edit`;
    urls.project2ScopeEdit = `${urls.project2Scope}/edit`;
    // Generate resource counter
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    authenticateSession({ isGlobal: true });
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
    await visit(urls.orgScopes);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgScopes);
  });

  test('can navigate among org scopes via header navigation', async function (assert) {
    await visit(urls.globalScope);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalScope);

    await click(ORG_SCOPES_DROPDOWN_SELECTOR(urls.orgScope));
    assert.strictEqual(currentURL(), urls.orgScopes);

    await click(ORG_SCOPES_DROPDOWN_SELECTOR(urls.org2Scope));
    assert.strictEqual(currentURL(), urls.org2Scopes);
  });

  test('can navigate among project scopes via header navigation', async function (assert) {
    await visit(urls.projectScope);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.projectScopeEdit);

    await click(PROJECT_SCOPES_DROPDOWN_SELECTOR(urls.project2Scope));

    assert.strictEqual(currentURL(), urls.project2ScopeEdit);
  });

  test('can create new org scopes', async function (assert) {
    const orgScopeCount = getScopeCount('org');
    await visit(urls.globalScope);

    await click(`[href="${urls.newOrgScope}"]`);
    await fillIn(NAME_FIELD_SELECTOR, 'random string');
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(getScopeCount('org'), orgScopeCount + 1);
  });

  test('can create new project scopes', async function (assert) {
    const orgScopeCount = getScopeCount('project');
    await visit(urls.orgScopes);

    await click(`[href="${urls.newProjectScope}"]`);
    await fillIn(NAME_FIELD_SELECTOR, 'random string');
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(getScopeCount('project'), orgScopeCount + 1);
  });

  test('can cancel create new org scopes', async function (assert) {
    const orgScopeCount = getScopeCount('org');
    await visit(urls.globalScope);

    await click(`[href="${urls.newOrgScope}"]`);
    await fillIn(NAME_FIELD_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.strictEqual(getScopeCount('org'), orgScopeCount);
  });

  test('can cancel create new project scopes', async function (assert) {
    const projectScopeCount = getScopeCount('project');
    await visit(urls.orgScopes);

    await click(`[href="${urls.newProjectScope}"]`);
    await fillIn(NAME_FIELD_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);

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

    await click(`[href="${urls.newOrgScope}"]`);
    await click(SAVE_BUTTON_SELECTOR);

    assert.dom('.rose-notification-body').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Name is required.');
  });
});
