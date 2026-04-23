/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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

    assert.dom('[data-test-grant-actions-card]').exists();
    assert.dom('[data-test-grant-action]').exists({ count: 8 });
    assert.deepEqual(
      [...this.element.querySelectorAll('[data-test-grant-action]')].map(
        (row) => row.textContent.trim(),
      ),
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
    assert.dom('[data-test-grant-actions-empty-state]').doesNotExist();
  });

  test('it renders the no resource type detected state when the current line has no detectable type', async function (assert) {
    this.grantString = 'output_fields=*';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom('[data-test-grant-actions-list]').doesNotExist();
    assert
      .dom('[data-test-grant-actions-no-type-detected]')
      .hasText('No resource type detected.');
    assert.dom('[data-test-grant-actions-empty-state]').doesNotExist();
  });

  test('it keeps the no suggestions state when a type is known but no actions apply', async function (assert) {
    this.grantString = 'type=host;actions=';

    await render(hbs`
      <GrantActions
        @grantsSchema={{this.grantsSchema}}
        @grantString={{this.grantString}}
      />
    `);

    assert.dom('[data-test-grant-actions-list]').doesNotExist();
    assert.dom('[data-test-grant-actions-no-type-detected]').doesNotExist();
    assert
      .dom('[data-test-grant-actions-empty-state]')
      .hasText('No suggestions');
  });
});
