/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | policies | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  let intl;

  const STORAGE_POLICY_TITLE = 'Storage Policies';
  const MESSAGE_DESCRIPTION_SELECTOR = '.rose-message-description';
  const MESSAGE_LINK_SELECTOR = '.rose-message-body .hds-link-standalone';
  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item a';

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

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;

    intl = this.owner.lookup('service:intl');

    authenticateSession({});
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
    assert.dom(`[href="${urls.policies}"]`).exists();

    // Tests that correct message is displayed when no policies exist
    await click(`[href="${urls.policies}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.policy.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
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
      .dom('[title="General"] a:nth-of-type(3)')
      .doesNotIncludeText(STORAGE_POLICY_TITLE);

    // Tests that correct message is displayed when no policies exist
    await visit(urls.policies);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.neither-list-nor-create', {
        resource: STORAGE_POLICY_TITLE,
      }),
    );
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
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
    assert.dom(`[href="${urls.policies}"]`).exists();

    // Tests that correct message is displayed when no policies exist
    await click(`[href="${urls.policies}"]`);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.create-but-not-list', {
        resource: STORAGE_POLICY_TITLE,
      }),
    );
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
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
    assert.dom(`[href="${urls.policies}"]`).exists();

    // Tests that correct message is displayed when no policies exist
    await click(`[href="${urls.policies}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.policy.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
  });

  test('user cannot navigate to index when feature is disabled', async function (assert) {
    await visit(urls.globalScope);

    assert.false(featuresService.isEnabled('ssh-session-recording'));

    assert.notOk(find(`[href="${urls.policies}"]`));
  });

  test('edit action in table directs user to appropriate page', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);
    instances.policy = this.server.create('policy', {
      scope: instances.scopes.global,
    });
    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(`[href="${urls.policies}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Edit');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.strictEqual(currentURL(), urls.policy);
  });
});
