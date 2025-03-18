/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | policies | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let features;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    policy: null,
  };

  const urls = {
    globalScope: null,
    policies: null,
    policy: null,
    unknownPolicy: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.policy = this.server.create('policy', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;
    urls.policy = `${urls.policies}/${instances.policy.id}`;
    urls.unknownPolicy = `${urls.policies}/foo`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    await authenticateSession({ username: 'admin' });
  });

  test('visiting a policy', async function (assert) {
    await visit(urls.globalScope);
    await a11yAudit();

    await click(commonSelectors.HREF(urls.policies));
    await a11yAudit();
    await click(commonSelectors.HREF(urls.policy));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.policy);
  });

  test('cannot navigate to a policy without proper authorization', async function (assert) {
    await visit(urls.globalScope);
    instances.policy.authorized_actions =
      instances.policy.authorized_actions.filter((item) => item !== 'read');

    await click(commonSelectors.HREF(urls.policies));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.policy)).doesNotExist();
  });

  test('visiting an unknown policy displays 404 message', async function (assert) {
    await visit(urls.unknownPolicy);
    await a11yAudit();

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });
});
