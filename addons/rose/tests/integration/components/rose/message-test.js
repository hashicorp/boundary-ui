import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Message />`);
    assert.ok(find('.rose-message'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Message id="message"/>`);
    assert.ok(find('#message'));
  });

  test('it renders with title', async function (assert) {
    await render(hbs`<Rose::Message @title="Title"/>`);
    assert.equal(find('.rose-message-title').textContent.trim(), 'Title');
  });

  test('it renders with subtitle', async function (assert) {
    await render(hbs`<Rose::Message @title="title" @subtitle="Subtitle"/>`);
    assert.equal(find('.rose-message-subtitle').textContent.trim(), 'Subtitle');
  });

  test('it renders with description', async function (assert) {
    await render(hbs`<Rose::Message @description="Description"/>`);
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'Description'
    );
  });

  test('it renders with link', async function (assert) {
    await render(hbs`<Rose::Message as |message|>
      <message.link />
      <message.link />
    </Rose::Message>`);
    assert.equal(findAll('.rose-message-link').length, 2);
  });
});
