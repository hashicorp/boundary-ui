/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | workers | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    worker: null,
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(async function () {
    //Generate the resources
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = '/scopes/global';
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow');
  });

  test('visiting worker', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.workers);

    await click(commonSelectors.HREF(urls.worker));

    assert.strictEqual(currentURL(), urls.worker);
  });

  test('cannot navigate to an worker form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((itm) => itm !== 'read');
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.workers));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.worker)).isNotVisible();
  });

  test('can navigate to an worker form with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.workers));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.worker)).isVisible();
  });

  test('users can navigate to worker and incorrect url autocorrects', async function (assert) {
    const orgScope = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    const incorrectUrl = `/scopes/${orgScope.id}/workers/${instances.worker.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.worker);
  });
});
