/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL, waitFor, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let intl;

  const ALIAS_TITLE = 'Aliases';
  const MESSAGE_DESCRIPTION_SELECTOR = '.hds-application-state__body';
  const MESSAGE_LINK_SELECTOR =
    '.hds-application-state__footer .hds-link-standalone';
  const DROPDOWN_BUTTON_SELECTOR = (id) =>
    `tbody [data-test-alias-row="${id}"] td:last-child .hds-dropdown-toggle-icon`;
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item a';
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-alias-results]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    alias: null,
    target: null,
    aliasWithTarget: null,
  };

  const urls = {
    globalScope: null,
    aliases: null,
    alias: null,
    aliasWithTarget: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
      destination_id: null,
    });
    instances.aliasWithTarget = this.server.create('alias', {
      scope: instances.scopes.global,
      destination_id: instances.target.id,
    });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    urls.aliasWithTarget = `${urls.aliases}/${instances.aliasWithTarget.id}`;
    intl = this.owner.lookup('service:intl');

    await authenticateSession({});
  });

  test('users can navigate to aliases with proper authorization', async function (assert) {
    this.server.schema.aliases.all().destroy();
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
    this.server.schema.aliases.all().destroy();
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
    this.server.schema.aliases.all().destroy();
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
    this.server.schema.aliases.all().destroy();
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

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR(instances.alias.id));

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Edit');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.strictEqual(currentURL(), urls.alias);
  });

  test('user can search for a specific alias by id', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.aliases}"]`);

    assert.dom(`[href="${urls.alias}"]`).exists();
    assert.dom(`[href="${urls.aliasWithTarget}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.alias.id);
    await waitFor(`[href="${urls.aliasWithTarget}"]`, { count: 0 });

    assert.dom(`[href="${urls.alias}"]`).exists();
    assert.dom(`[href="${urls.aliasWithTarget}"]`).doesNotExist();
  });

  test('user can search for aliases and get no results', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.aliases}"]`);

    assert.dom(`[href="${urls.alias}"]`).exists();
    assert.dom(`[href="${urls.aliasWithTarget}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake alias that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.alias}"]`).doesNotExist();
    assert.dom(`[href="${urls.aliasWithTarget}"]`).doesNotExist();
    assert
      .dom(NO_RESULTS_MSG_SELECTOR)
      .includesText(intl.t('titles.no-results-found'));
  });
});
