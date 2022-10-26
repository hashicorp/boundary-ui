import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-status', function (hooks) {
  setupRenderingTest(hooks);
  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<SessionStatus />`);
    assert.ok(find('.hds-badge'));
  });

  test('it maps to correct text color and icon based on status', async function (assert) {
    assert.expect(2);
    await render(hbs`<SessionStatus @text='Active'/>`);
    assert.ok(find('.flight-icon-check'));
    assert.ok(find('.hds-badge--color-success'));
  });
});
