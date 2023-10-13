/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | key-value-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders fields', async function (assert) {
    await render(hbs`
        <Form::Field::KeyValueList as |M|>
          <M.Legend>Label</M.Legend>
          <M.HelperText>Help</M.HelperText>
          <M.Error as |E|>
            <E.Message>Error!</E.Message>
          </M.Error>
        </Form::Field::KeyValueList>
    `);

    assert.dom('tbody tr').exists({ count: 1 });
    assert.dom('legend').exists().hasText('Label');
    assert.dom('.hds-form-helper-text').exists().hasText('Help');
    assert.dom('.hds-form-error__message').exists().hasText('Error!');
    assert.dom('button').exists().hasText('Add');
  });

  test('it renders multiple options', async function (assert) {
    this.options = [
      { key: 'one', value: 'two' },
      { key: 'three', value: 'four' },
    ];

    // Template block usage:
    await render(hbs`
        <Form::Field::KeyValueList
            @options={{this.options}}
        />
    `);

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('it renders multiple options with only keys', async function (assert) {
    this.options = [{ key: 'one' }, { key: 'three' }];

    // Template block usage:
    await render(hbs`
        <Form::Field::KeyValueList
            @options={{this.options}}
            @hasNoValue={{true}}
        />
    `);

    assert.dom('tbody tr:first-child td').exists({ count: 2 });
    assert.dom('tbody tr').exists({ count: 3 });
  });
});
