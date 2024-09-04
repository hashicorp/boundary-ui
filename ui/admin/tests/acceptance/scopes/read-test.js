/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let features;
  let featureEdition;

  const FORM_SELECTOR = 'main .rose-form';
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-projects-dropdown] div:first-child button';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-projects-dropdown] ul li button';
  const STORAGE_POLICY_SIDEBAR = '.policy-sidebar';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };
  const urls = {
    globalScope: null,
    globalScopeEdit: null,
    orgScope: null,
    orgScopeEdit: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.globalScopeEdit = `/scopes/global/edit`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    features = this.owner.lookup('service:features');
    featureEdition = this.owner.lookup('service:featureEdition');
    authenticateSession({ isGlobal: true, username: 'admin' });
  });

  test('visiting org scope edit', async function (assert) {
    await visit(urls.orgScope);
    await a11yAudit();

    await click(`[href="${urls.orgScopeEdit}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(FORM_SELECTOR).exists();
    assert.dom(MANAGE_DROPDOWN_SELECTOR).exists();
  });

  test('visiting global scope settings when feature flag is enabled', async function (assert) {
    features.enable('ssh-session-recording');
    await visit(urls.globalScope);
    await a11yAudit();

    await click(`[href="${urls.globalScopeEdit}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(FORM_SELECTOR).exists();
    assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
    assert.dom(DELETE_ACTION_SELECTOR).doesNotExist();
  });

  test('user cannot visit global scope settings when feature flag is not enabled', async function (assert) {
    await visit(urls.globalScope);

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.dom(`[href="${urls.globalScopeEdit}"]`).doesNotExist();
  });

  test('user can attatch a storage policy to a scope in enterprise edition', async function (assert) {
    featureEdition.setEdition('enterprise', ['ssh-session-recording']);
    await visit(urls.globalScope);

    await click(`[href="${urls.globalScopeEdit}"]`);

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(STORAGE_POLICY_SIDEBAR).exists();
  });

  test('user can attatch a storage policy to a scope in hcp edition', async function (assert) {
    featureEdition.setEdition('hcp', ['ssh-session-recording']);
    await visit(urls.globalScope);

    await click(`[href="${urls.globalScopeEdit}"]`);

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(STORAGE_POLICY_SIDEBAR).exists();
  });

  test('visiting org scope edit without read permission results in no form displayed', async function (assert) {
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'read',
      ),
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(FORM_SELECTOR).doesNotExist();
  });
});
