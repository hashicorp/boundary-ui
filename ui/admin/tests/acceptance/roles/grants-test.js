/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | grants', function (hooks) {
  setupApplicationTest(hooks);

  // This is unique to permissions tests and only used once here
  const FIELD_GRANT_DISABLED = 'input[disabled]';

  let grantsCount;

  const instances = {
    scopes: {
      org: null,
    },
    role: null,
  };
  const urls = {
    roles: null,
    role: null,
    newRole: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    });
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.grants = `${urls.role}/grants`;
    grantsCount = () =>
      this.server.schema.roles.all().models[0].grant_strings.length;
  });

  test('visiting role grants', async function (assert) {
    await visit(urls.grants);

    assert.strictEqual(currentURL(), urls.grants);
    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });
  });

  test('cannot set grants without proper authorization', async function (assert) {
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'set-grants',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.grants);

    // This checks that only the form for existing grants is displayed
    assert.dom(commonSelectors.FORM).exists({ count: 1 });
    assert.dom(selectors.FIELD_NEW_GRANT_ADD_BTN).doesNotExist();
    assert.dom(FIELD_GRANT_DISABLED).exists({ count: grantsCount() });
    assert.dom(selectors.SAVE_BTN).doesNotExist();
    assert.dom(commonSelectors.CANCEL_BTN).doesNotExist();
  });

  test('update a grant', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/roles/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.strictEqual(
          attrs.grant_strings[0],
          selectors.FIELD_GRANT_VALUE,
          'A grant is updated',
        );
        const id = idMethod.split(':')[0];
        return { id };
      },
    );
    await visit(urls.grants);

    await fillIn(selectors.FIELD_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(selectors.SAVE_BTN);
  });

  test('cancel a grant update', async function (assert) {
    await visit(urls.grants);

    await fillIn(selectors.FIELD_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert
      .dom(selectors.FIELD_GRANT)
      .doesNotIncludeText(selectors.FIELD_GRANT_VALUE);
  });

  test('shows error message on grant update', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.grants);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });

    await fillIn(selectors.FIELD_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(selectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('create a grant', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/roles/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.strictEqual(
          attrs.grant_strings.length,
          grantsCount() + 1,
          'A grant is created',
        );
        const id = idMethod.split(':')[0];
        return { id };
      },
    );
    await visit(urls.grants);

    await fillIn(selectors.FIELD_NEW_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(selectors.FIELD_NEW_GRANT_ADD_BTN);
    await click(selectors.SAVE_BTN);
  });

  test('cancel a grant creation', async function (assert) {
    await visit(urls.grants);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });

    await fillIn(selectors.FIELD_NEW_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(selectors.FIELD_NEW_GRANT_ADD_BTN);
    await click(commonSelectors.CANCEL_BTN);

    assert.dom(selectors.FIELD_NEW_GRANT).hasNoText();
    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });
  });

  test('shows error message on grant create', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.grants);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });

    await fillIn(selectors.FIELD_NEW_GRANT, selectors.FIELD_GRANT_VALUE);
    await click(selectors.FIELD_NEW_GRANT_ADD_BTN);
    await click(selectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('delete a grant', async function (assert) {
    await visit(urls.grants);

    await click(selectors.FIELD_GRANT_REMOVE_BTN);
    await click(selectors.SAVE_BTN);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() - 1 });
  });

  test('cancel a grant remove', async function (assert) {
    await visit(urls.grants);

    await click(selectors.FIELD_GRANT_REMOVE_BTN);
    await click(commonSelectors.CANCEL_BTN);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });
  });

  test('shows error message on grant remove', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.grants);

    assert.dom(selectors.FIELD_GRANT).exists({ count: grantsCount() });

    await click(selectors.FIELD_GRANT_REMOVE_BTN);
    await click(selectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });
});
