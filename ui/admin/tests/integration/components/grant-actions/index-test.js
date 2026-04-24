/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as commonSelectors from 'admin/tests/helpers/selectors';

const GRANT_ACTIONS_TABLE = '[data-test-grant-actions-table]';
const GRANT_ACTIONS_EMPTY_STATE = '[data-test-grant-actions-empty-state]';
const GRANT_ACTIONS_NO_TYPE_DETECTED =
  '[data-test-grant-actions-no-type-detected]';
const GRANT_ACTIONS_INVALID_ID_OR_TYPE =
  '[data-test-grant-actions-invalid-id-or-type]';

module('Integration | Component | grant-actions/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.grantsSchema = {
      resource_types: [
        {
          type: 'host-catalog',
          collection_actions: ['create', 'list'],
          id_actions: ['read', 'update', 'delete'],
          id_prefixes: ['hcst'],
        },
        {
          type: 'host',
          parent_type: 'host-catalog',
          collection_actions: ['create', 'list'],
          id_actions: ['read', 'update', 'delete'],
          id_prefixes: ['h'],
        },
        {
          type: 'host-set',
          parent_type: 'host-catalog',
          collection_actions: ['create', 'list'],
          id_actions: [
            'delete',
            'add-hosts',
            'set-hosts',
            'remove-hosts',
            'read',
            'update',
          ],
          id_prefixes: ['hs'],
        },
      ],
    };
  });

  test('it renders the actions relevant to the current grant line', async function (assert) {
    this.grantString = 'ids=hcst_1234567890;type=host-set';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom(GRANT_ACTIONS_TABLE).isVisible();
    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 8 });

    const rows = [...this.element.querySelectorAll(commonSelectors.TABLE_ROWS)];
    const rowData = rows.map((row) => {
      const cells = [...row.querySelectorAll('td')].map((cell) =>
        cell.textContent.trim(),
      );

      return {
        name: cells[0],
        description: cells[1],
      };
    });

    assert.deepEqual(
      rowData.map(({ name }) => name),
      [
        'add-hosts',
        'create',
        'delete',
        'list',
        'read',
        'remove-hosts',
        'set-hosts',
        'update',
      ],
    );

    assert.deepEqual(rowData[0], {
      name: 'add-hosts',
      description: 'Add hosts to a host set',
    });

    assert.deepEqual(rowData[1], {
      name: 'create',
      description: 'Create a new host-set',
    });

    assert.deepEqual(rowData.at(-1), {
      name: 'update',
      description: 'Update a host-set',
    });

    assert.dom(GRANT_ACTIONS_EMPTY_STATE).doesNotExist();
    assert.dom(GRANT_ACTIONS_NO_TYPE_DETECTED).doesNotExist();
  });

  test('it renders the no resource type detected state when the current line has no detectable type', async function (assert) {
    this.grantString = 'output_fields=*';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom(GRANT_ACTIONS_TABLE).doesNotExist();
    assert.dom(GRANT_ACTIONS_INVALID_ID_OR_TYPE).doesNotExist();
    assert
      .dom(GRANT_ACTIONS_NO_TYPE_DETECTED)
      .hasText('No resource type detected.');
    assert.dom(GRANT_ACTIONS_EMPTY_STATE).doesNotExist();
  });

  test('it renders the invalid ID and type state for an unknown type', async function (assert) {
    this.grantString = 'type=not-a-real-type;actions=';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom(GRANT_ACTIONS_TABLE).doesNotExist();
    assert.dom(GRANT_ACTIONS_NO_TYPE_DETECTED).doesNotExist();
    assert.dom(GRANT_ACTIONS_EMPTY_STATE).doesNotExist();
    assert
      .dom(GRANT_ACTIONS_INVALID_ID_OR_TYPE)
      .hasText('Invalid ID and type. No actions available.');
  });

  test('it renders the invalid ID and type state for an unknown ID', async function (assert) {
    this.grantString = 'ids=bad_123;actions=';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom(GRANT_ACTIONS_TABLE).doesNotExist();
    assert.dom(GRANT_ACTIONS_NO_TYPE_DETECTED).doesNotExist();
    assert.dom(GRANT_ACTIONS_EMPTY_STATE).doesNotExist();
    assert
      .dom(GRANT_ACTIONS_INVALID_ID_OR_TYPE)
      .hasText('Invalid ID and type. No actions available.');
  });

  test('it keeps the no suggestions state when a type is known but no actions apply', async function (assert) {
    this.grantString = 'type=host;actions=';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom(GRANT_ACTIONS_TABLE).doesNotExist();
    assert.dom(GRANT_ACTIONS_INVALID_ID_OR_TYPE).doesNotExist();
    assert.dom(GRANT_ACTIONS_NO_TYPE_DETECTED).doesNotExist();
    assert.dom(GRANT_ACTIONS_EMPTY_STATE).hasText('No suggestions');
  });
});
