/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let features;
  let getAliasCount;

  const SAVE_BTN_SELECTOR = '[type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const DESTINATION_ID_SELECTOR = '[name="destination_id"]';
  const HOST_ID_SELECTOR = '[name="authorize_session_arguments"]';

  const ALERT_TEXT_SELECTOR = '[role="alert"] div';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const NAME_FIELD_TEXT = 'random string';

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

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.newAlias = `${urls.aliases}/new`;
    getAliasCount = () => this.server.schema.aliases.all().models.length;
    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('users can create a new alias with host and target info', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);

    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await fillIn(DESTINATION_ID_SELECTOR, 'tcp_123');
    await fillIn(HOST_ID_SELECTOR, 'h_123');
    await click(SAVE_BTN_SELECTOR);
    const alias = this.server.schema.aliases.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(alias.name, NAME_FIELD_TEXT);
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('users can create a new alias without host or target info', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);

    await click(SAVE_BTN_SELECTOR);
    const alias = this.server.schema.aliases.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(alias.name, NAME_FIELD_TEXT);
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('user can cancel new alias creation', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.newAlias);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(CANCEL_BTN_SELECTOR);

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
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
  });

  test('can navigate to new aliases route with proper authorization', async function (assert) {
    await visit(urls.aliases);

    assert.ok(
      instances.scopes.global.authorized_collection_actions.aliases.includes(
        'create',
      ),
    );

    assert.dom(`[href="${urls.newAlias}"]`).isVisible();
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
