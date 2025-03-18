/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | policies | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let intl;

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
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;

    intl = this.owner.lookup('service:intl');

    await authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('users can navigate to policies with proper authorization', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.policies)).exists();

    await click(commonSelectors.HREF(urls.policies));

    assert
      .dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION)
      .hasText(intl.t('resources.policy.messages.none.description'));
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['policies'] = [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('create'),
    );
    assert
      .dom(commonSelectors.GENERAL_SIDEBAR_NAV_LINK(urls.policies))
      .doesNotExist();

    await visit(urls.policies);

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).hasText(
      intl.t('descriptions.neither-list-nor-create', {
        resource: 'Storage Policies',
      }),
    );
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['policies'] =
      instances.scopes.global.authorized_collection_actions['policies'].filter(
        (item) => item !== 'list',
      );

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.policies)).exists();

    await click(commonSelectors.HREF(urls.policies));

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).hasText(
      intl.t('descriptions.create-but-not-list', {
        resource: 'Storage Policies',
      }),
    );
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['policies'] =
      instances.scopes.global.authorized_collection_actions['policies'].filter(
        (item) => item !== 'create',
      );

    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.policies)).exists();

    await click(commonSelectors.HREF(urls.policies));

    assert
      .dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION)
      .hasText(intl.t('resources.policy.messages.none.description'));
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).doesNotExist();
  });

  test('user cannot navigate to index when feature is disabled', async function (assert) {
    await visit(urls.globalScope);

    assert.false(featuresService.isEnabled('ssh-session-recording'));

    assert.dom(commonSelectors.HREF(urls.policies)).doesNotExist();
  });

  test('edit action in table directs user to appropriate page', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);
    instances.policy = this.server.create('policy', {
      scope: instances.scopes.global,
    });
    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(commonSelectors.HREF(urls.policies));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_LINK)
      .exists()
      .hasText('Edit');

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_LINK);

    assert.strictEqual(currentURL(), urls.policy);
  });
});
