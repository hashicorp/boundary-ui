/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';

import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | groups | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let groupsCount;

  const instances = {
    scopes: {
      org: null,
    },
    group: null,
  };
  const urls = {
    groups: null,
    group: null,
    newGroup: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
    );
    instances.group = this.server.create('group', {
      scope: instances.scopes.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.newGroup = `${urls.groups}/new`;

    groupsCount = () => this.server.schema.groups.all().models.length;
  });

  test('can create new group', async function (assert) {
    const count = groupsCount();
    await visit(urls.newGroup);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(groupsCount(), count + 1);
  });

  test('can navigate to new groups route with proper authorization', async function (assert) {
    await visit(urls.groups);

    assert.ok(
      instances.scopes.org.authorized_collection_actions.groups.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newGroup)).isVisible();
  });

  test('cannot navigate to new groups route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.groups = [];
    await visit(urls.groups);

    assert.notOk(
      instances.scopes.org.authorized_collection_actions.groups.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newGroup)).doesNotExist();
  });

  test('can cancel new group creation', async function (assert) {
    const count = groupsCount();
    await visit(urls.newGroup);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.groups);
    assert.strictEqual(groupsCount(), count);
  });

  test('saving a new group with invalid fields displays error messages', async function (assert) {
    this.server.post('/groups', () => {
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
    await visit(urls.newGroup);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('users cannot directly navigate to new group route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.groups =
      instances.scopes.org.authorized_collection_actions.groups.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newGroup);

    assert.notOk(
      instances.scopes.org.authorized_collection_actions.groups.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.groups);
  });
});
