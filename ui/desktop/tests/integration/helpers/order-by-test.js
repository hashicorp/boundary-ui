/**
 * Copyright IBM Corp. 2021, 2026
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

    this.set('customOrder', ['username', 'none', 'password']);

    await render(hbs`
      <ul>
        {{#each (order-by this.inputValue this.customOrder) as |secret|}}
          <li>{{secret.key}}</li>
        {{/each}}
      </ul>
    `);

    assert.dom('li').exists({ count: 3 });
    assert.strictEqual(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'username none password',
    );
  });

  test('maintains order if there are no matching keys in the list', async function (assert) {
    this.set('inputValue', [
      { key: 'username', value: 1 },
      { key: 'password', value: 2 },
      { key: 'none', value: 3 },
    ]);

    this.set('customOrder', ['one', 'two', 'three']);

    await render(hbs`
      <ul>
        {{#each (order-by this.inputValue this.customOrder) as |secret|}}
          <li>{{secret.key}}</li>
        {{/each}}
      </ul>
    `);

    assert.dom('li').exists({ count: 3 });
    assert.strictEqual(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'username password none',
    );
  });

  test('maintains order if there are only some matching keys in the list', async function (assert) {
    this.set('inputValue', [
      { key: 'username', value: 1 },
      { key: 'password', value: 2 },
      { key: 'email', value: 3 },
      { key: 'none', value: 3 },
    ]);

    this.set('customOrder', ['none', 'email']);

    await render(hbs`
      <ul>
        {{#each (order-by this.inputValue this.customOrder) as |secret|}}
          <li>{{secret.key}}</li>
        {{/each}}
      </ul>
    `);

    assert.dom('li').exists({ count: 4 });
    assert.strictEqual(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'none email username password',
    );
  });
});
