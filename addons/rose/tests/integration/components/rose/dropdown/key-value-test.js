import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/dropdown/key-value', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Dropdown::KeyValue>
        <:key>key</:key>
        <:value>value</:value>
      </Rose::Dropdown::KeyValue>
    `);

    assert.equal(find('.rose-dropdown-key').textContent.trim(), 'key');
    assert.equal(find('.rose-dropdown-value').textContent.trim(), 'value');
  });
});
