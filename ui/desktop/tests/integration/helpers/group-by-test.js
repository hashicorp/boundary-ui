/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | group-by', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function (assert) {
    this.set('inputValue', [
      { group: 'a', id: '1' },
      { group: 'a', id: '2' },
      { group: 'b', id: '3' },
      { group: 'b', id: '4' },
      { group: 'c', id: '5' },
      { group: 'c', id: '6' },
    ]);

    await render(hbs`
      <ul>
        {{#each (group-by this.inputValue 'group') as |group|}}
          <li>{{group.key}}</li>
        {{/each}}
      </ul>
    `);

    assert.strictEqual(findAll('li').length, 3);
  });
});
