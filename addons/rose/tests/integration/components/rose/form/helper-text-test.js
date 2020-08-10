import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/helper-text', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Form::HelperText>
        Helper text
      </Rose::Form::HelperText>
    `);
    assert.ok(find('.rose-form-helper-text'));
    assert.equal(
      find('.rose-form-helper-text').textContent.trim(),
      'Helper text'
    );
  });
});
