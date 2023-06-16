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

  const MESSAGE_SELECTOR = '.rose-message-subtitle';
  const TABLE_LINK_SELECTOR = '.hds-table__tbody tr:first-child a';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    storageBucket: null,
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
    storageBucket: null,
    unknownStorageBucket: null,
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
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;
    urls.unknownStorageBucket = `${urls.storageBuckets}/foo`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('visiting a storage bucket', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);
    await a11yAudit();

    await click(`[href="${urls.storageBuckets}"]`);
    await a11yAudit();
    await click(`[href="${urls.storageBucket}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.storageBucket);
  });

  test('cannot navigate to a storage bucket without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);
    instances.storageBucket.authorized_actions =
      instances.storageBucket.authorized_actions.filter(
        (item) => item !== 'read'
      );

    await click(`[href="${urls.storageBuckets}"]`);

    assert.dom(TABLE_LINK_SELECTOR).doesNotExist();
  });

  test('visiting an unknown storage bucket displays 404 message', async function (assert) {
    assert.expect(1);

    await visit(urls.unknownStorageBucket);
    await a11yAudit();

    assert.dom(MESSAGE_SELECTOR).hasText('Error 404');
  });
});
