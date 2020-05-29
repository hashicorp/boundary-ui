import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/errors/message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Errors::Message>
        An error occurred.
      </Rose::Form::Errors::Message>
    `);
    assert.equal(this.element.textContent.trim(), 'An error occurred.');
  });
});
