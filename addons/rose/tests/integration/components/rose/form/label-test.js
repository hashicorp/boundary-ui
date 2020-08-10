import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/label', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Form::Label>
        Form Label
      <//Rose::Form::Label>
    `);
    assert.ok(find('.rose-form-label'));
    assert.equal(
      find('.rose-form-label').textContent.trim(),
      'Form Label'
    );
  });
});
