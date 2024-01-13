/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
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

  let features;

  const FORM_SELECTOR = 'main .rose-form';
  const FORM_ACTIONS_SELECTOR = '.rose-form-actions';
  const DELETE_DROPDOWN_SELECTOR =
    '.rose-layout-page-actions .rose-dropdown-button-danger';

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
    urls.globalScope = `/scopes/global`;
    urls.globalScopeEdit = `/scopes/global/edit`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    features = this.owner.lookup('service:features');
    authenticateSession({ isGlobal: true });
  });

  test('visiting org scope edit', async function (assert) {
    await visit(urls.orgScope);
    await a11yAudit();

    await click(`[href="${urls.orgScopeEdit}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(FORM_SELECTOR).exists();
    assert.dom(FORM_ACTIONS_SELECTOR).exists();
    assert.dom(DELETE_DROPDOWN_SELECTOR).exists();
  });

  test('visiting global scope edit', async function (assert) {
    features.enable('ssh-session-recording');
    await visit(urls.globalScope);
    await a11yAudit();

    await click(`[href="${urls.globalScopeEdit}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(FORM_SELECTOR).exists();
    assert.dom(FORM_ACTIONS_SELECTOR).doesNotExist();
    assert.dom(DELETE_DROPDOWN_SELECTOR).doesNotExist();
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
