import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(5);
    await render(hbs`
      <Rose::Message @title="Title" @subtitle="Subtitle" as |message|>
        <message.description>Description</message.description>
        <message.link @route="index">Link</message.link>
      </Rose::Message>
    `);
    assert.ok(find('.rose-message'));
    assert.strictEqual(find('.rose-message-title').textContent.trim(), 'Title');
    assert.strictEqual(find('.rose-message-subtitle').textContent.trim(), 'Subtitle');
    assert.strictEqual(
      find('.rose-message-description').textContent.trim(),
      'Description'
    );
    assert.strictEqual(find('.rose-message-link').textContent.trim(), 'Link');
  });
});
