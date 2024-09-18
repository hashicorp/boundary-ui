/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | order-by', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', [
      { key: 'username', value: 1 },
      { key: 'password', value: 2 },
      { key: 'none', value: 3 },
    ]);

    await render(hbs`
      <ul>
        {{#each (order-by this.inputValue 'none') as |secret|}}
          <li>{{secret.key}}</li>
        {{/each}}
      </ul>
    `);

    assert.dom('li').exists({ count: 3 });
    assert.strictEqual(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'none username password',
    );
  });
});
