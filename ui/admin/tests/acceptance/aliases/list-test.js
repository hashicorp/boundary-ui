/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let intl;

  const ALIAS_TITLE = 'Aliases';
  const MESSAGE_DESCRIPTION_SELECTOR = '.rose-message-description';
  const MESSAGE_LINK_SELECTOR = '.rose-message-body .hds-link-standalone';
  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item a';

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
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;

    intl = this.owner.lookup('service:intl');

    authenticateSession({});
  });

  test('users can navigate to aliases with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    assert.ok(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'list',
      ),
    );
    assert.ok(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'create',
      ),
    );

    assert.dom(`[href="${urls.aliases}"]`).isVisible();

    await click(`[href="${urls.aliases}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.alias.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.global.authorized_collection_actions['aliases'] = [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'list',
      ),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'create',
      ),
    );
    assert
      .dom('[title="General"] a:nth-of-type(1)')
      .doesNotIncludeText(ALIAS_TITLE);

    await visit(urls.aliases);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.neither-list-nor-create', {
        resource: ALIAS_TITLE,
      }),
    );
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    instances.scopes.global.authorized_collection_actions['aliases'] =
      instances.scopes.global.authorized_collection_actions['aliases'].filter(
        (item) => item !== 'list',
      );

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'list',
      ),
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.aliases}"]`).exists();

    await click(`[href="${urls.aliases}"]`);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.create-but-not-list', {
        resource: ALIAS_TITLE,
      }),
    );
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    instances.scopes.global.authorized_collection_actions['aliases'] =
      instances.scopes.global.authorized_collection_actions['aliases'].filter(
        (item) => item !== 'create',
      );

    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'list',
      ),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.aliases}"]`).exists();

    await click(`[href="${urls.aliases}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.alias.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
  });

  test('edit action in table directs user to appropriate page', async function (assert) {
    await visit(urls.globalScope);
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });
    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Edit');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.strictEqual(currentURL(), urls.alias);
  });
});
