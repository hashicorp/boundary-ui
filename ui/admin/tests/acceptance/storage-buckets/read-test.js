/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | storage-buckets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let features;

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

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
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
  });

  test('visiting a storage bucket', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.storageBuckets);

    await click(commonSelectors.HREF(urls.storageBucket));

    assert.strictEqual(currentURL(), urls.storageBucket);
  });

  test('cannot navigate to a storage bucket without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);
    instances.storageBucket.authorized_actions =
      instances.storageBucket.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(commonSelectors.HREF(urls.storageBuckets));

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.storageBucket))
      .doesNotExist();
  });

  test('visiting an unknown storage bucket displays 404 message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.unknownStorageBucket);

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can navigate to storage bucket and incorrect url auto-corrects', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const incorrectUrl = `/scopes/${instances.scopes.org.id}/storage-buckets/${instances.storageBucket.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.storageBucket);
  });
});
