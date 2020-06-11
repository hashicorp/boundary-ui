import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/message/link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Message::Link />`);
    assert.ok(find('.rose-message-link'));
    assert.ok(find('.rose-message-link-right-align'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Message::Link>Link content</Rose::Message::Link>`);
    assert.equal(find('.rose-message-link').textContent.trim(), 'Link content');
  });

  test('it renders left aligned', async function (assert) {
    this.set('leftAlign', true);
    await render(hbs`<Rose::Message::Link @leftAlign={{this.leftAlign}} />`);
    assert.ok(find('.rose-message-link-left-align'));

    this.set('leftAlign', false);
    assert.notOk(find('.rose-message-link-left-align'));
  });
});
