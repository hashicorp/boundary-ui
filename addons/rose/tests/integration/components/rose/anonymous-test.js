/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/anonymous', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      {{#rose/anonymous tagName='main'}}
        template block text
      {{/rose/anonymous}}
    `);
    assert.ok(find('main'));
    assert.strictEqual(this.element.textContent.trim(), 'template block text');
  });
});
