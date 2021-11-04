import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/toolbar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Toolbar />`);
    assert.ok(find('.rose-toolbar'));
  });

  test('it renders with attributes', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Toolbar id="toolbar"/>`);
    assert.ok(find('#toolbar'));
  });
});
