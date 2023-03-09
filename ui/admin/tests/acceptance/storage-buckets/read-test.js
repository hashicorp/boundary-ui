/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | storage-buckets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;

    features = this.owner.lookup('service:features');
    features.enable('session-recording');
    authenticateSession({});
  });

  test('visiting storage buckets', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);
    await a11yAudit();

    await click(`[href="${urls.storageBuckets}"]`);

    assert.strictEqual(currentURL(), urls.storageBuckets);
  });
});
