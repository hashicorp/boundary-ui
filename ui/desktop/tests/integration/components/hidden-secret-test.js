import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | hidden-secret', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with a secret', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <HiddenSecret @secret='AAaaBBccDDeeOTXzSMT1234BB_Z8JzG7JkSVxI' />
    `);

    assert.ok(find('.hidden-secret'));
    assert.equal(
      find('.hidden-secret > div > span').textContent.trim(),
      '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■'
    );
  });
});
