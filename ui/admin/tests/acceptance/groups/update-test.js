/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | groups | update', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    group: null,
  };
  const urls = {
    orgScope: null,
    groups: null,
    group: null,
    newGroup: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create('group', {
      scope: instances.scopes.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.newGroup = `${urls.groups}/new`;
  });

  test('can save changes to an existing group', async function (assert) {
    await visit(urls.group);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.group);
    assert.strictEqual(
      this.server.schema.groups.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing group without proper authorization', async function (assert) {
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'update');

    await visit(urls.group);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to an existing group', async function (assert) {
    await visit(urls.group);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(instances.group.name, commonSelectors.FIELD_NAME_VALUE);
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.group.name);
  });

  test('saving an existing group with invalid fields displays error messages', async function (assert) {
    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.patch('/groups/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
        },
      );
    });
    await visit(urls.group);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });
});
