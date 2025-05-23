/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | aliases | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    alias: null,
  };

  const urls = {
    globalScope: null,
    aliases: null,
    alias: null,
    unknownAlias: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    urls.unknownAlias = `${urls.aliases}/foo`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting an alias', async function (assert) {
    await visit(urls.globalScope);
    await a11yAudit();

    await click(commonSelectors.HREF(urls.aliases));
    await a11yAudit();
    await click(commonSelectors.HREF(urls.alias));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.alias);
  });

  test('cannot navigate to an alias without proper authorization', async function (assert) {
    await visit(urls.globalScope);
    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'read');

    await click(commonSelectors.HREF(urls.aliases));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.alias)).doesNotExist();
  });

  test('visiting an unknown alias displays 404 message', async function (assert) {
    await visit(urls.unknownAlias);
    await a11yAudit();

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });
});
