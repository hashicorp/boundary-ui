import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/frame', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Frame>
        <:header>Header</:header>
        <:body>Body</:body>
      </Rose::Frame>
    `);

    assert.ok(find('section > header'));
    assert.ok(find('section > div'));
  });
});
