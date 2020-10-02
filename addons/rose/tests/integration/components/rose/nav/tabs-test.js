import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/nav/tabs', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Nav::Tabs as |nav|>
        <nav.link @route='index'>Item Name</nav.link>
      </Rose::Nav::Tabs>
    `);
    assert.ok(find('.rose-nav-tabs'));
    assert.equal(find('.rose-nav-link').textContent.trim(), 'Item Name');
  });
});
