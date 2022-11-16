import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/info-field', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    await render(hbs`
      <Rose::InfoField
        @title="Title"
        @subtitle="Subtitle"
        @description="Description"
      />
    `);
    assert.ok(find('.rose-info-field'));
    assert.strictEqual(
      find('.rose-info-field-title').textContent.trim(),
      'Title'
    );
    assert.strictEqual(
      find('.rose-info-field-subtitle').textContent.trim(),
      'Subtitle'
    );
    assert.strictEqual(
      find('.rose-info-field-description').textContent.trim(),
      'Description'
    );
  });
});
