import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/cards', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Cards as |cards|>
        <cards.link
          @title="Card Title"
          @description="Description"
        />
      </Rose::Cards>
    `);
    assert.ok(find('.rose-cards'));
    assert.ok(find('.rose-card-link'));
  });
});
