/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | aliases | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let features;
  let getAliasCount;

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    aliases: null,
    newAlias: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.newAlias = `${urls.aliases}/new`;
    getAliasCount = () => this.server.schema.aliases.all().models.length;
    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    await authenticateSession({ username: 'admin' });
  });

  test('users can create a new alias with host and target info', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(selectors.FIELD_DESTINATION_ID, 'tcp_123');
    await fillIn(selectors.FIELD_HOST_ID, 'h_123');
    await click(commonSelectors.SAVE_BTN);
    const alias = this.server.schema.aliases.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(alias.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('users can create a new alias without host or target info', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(commonSelectors.SAVE_BTN);
    const alias = this.server.schema.aliases.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(alias.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('user can cancel new alias creation', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.aliases);
    assert.strictEqual(getAliasCount(), aliasCount);
  });

  test('saving a new alias with invalid fields displays error messages', async function (assert) {
    this.server.post('/aliases', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newAlias);
    await click(commonSelectors.SAVE_BTN);
    await a11yAudit();

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('can navigate to new aliases route with proper authorization', async function (assert) {
    await visit(urls.aliases);

    assert.ok(
      instances.scopes.global.authorized_collection_actions.aliases.includes(
        'create',
      ),
    );

    assert.dom(commonSelectors.HREF(urls.newAlias)).isVisible();
  });

  test('users cannot directly navigate to new alias route without proper authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions['aliases'] =
      instances.scopes.global.authorized_collection_actions['aliases'].filter(
        (item) => item !== 'create',
      );

    await visit(urls.newAlias);

    assert.false(
      instances.scopes.global.authorized_collection_actions['aliases'].includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.aliases);
  });
});
