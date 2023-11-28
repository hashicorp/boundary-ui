import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | time-remaining', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it calculates the correct time remaining', async function (assert) {
    assert.expect(1);

    this.set('expirationTime', new Date(Date.now() + 1000 * 60 * 60 * 24));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(this.element.textContent.trim(), '23:59:59 remaining');
  });

  test('it handles negative time remaining', async function (assert) {
    assert.expect(1);

    this.set('expirationTime', new Date(Date.now() - 1000 * 60 * 60 * 24));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(this.element.textContent.trim(), '0:00:00 remaining');
  });
});
