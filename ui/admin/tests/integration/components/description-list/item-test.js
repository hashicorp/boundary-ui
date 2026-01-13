/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | description-list/item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders label (dt)', async function (assert) {
    this.set('label', 'Test Label');
    this.set('value', 'Test Value');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        {{this.value}}
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dt').hasText('Test Label');
  });

  test('it renders yielded content (dd)', async function (assert) {
    this.set('label', 'Label');
    this.set('value', 'Test Value Content');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        {{this.value}}
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd').hasText('Test Value Content');
  });
});
