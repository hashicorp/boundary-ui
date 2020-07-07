import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | error-message', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a model error', async function(assert) {
    this.set('model', { errors: [{
      isUnknown: true,
      status: 510
    }]});

    await render(hbs`<ErrorMessage @model={{this.model}} />`);
    assert.equal(find('.rose-message-title').textContent.trim(), 'Something went wrong');
    assert.equal(find('.rose-message-subtitle').textContent.trim(), 'Error 510');
  });
});
