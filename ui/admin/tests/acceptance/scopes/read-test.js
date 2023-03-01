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

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };
  const urls = {
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
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    authenticateSession({ isGlobal: true });
  });

  test('visiting org scope edit', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScope);
    await a11yAudit();

    await click(`[href="${urls.orgScopeEdit}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom('main .rose-form').exists();
  });

  test('visiting org scope edit without read permission results in no form displayed', async function (assert) {
    assert.expect(2);
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'read'
      ),
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom('main .rose-form').doesNotExist();
  });
});
