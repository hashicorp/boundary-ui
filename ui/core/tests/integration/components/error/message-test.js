import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | error/message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders predefined message for known error status', async function (assert) {
    this.set('status', '401');

    await render(hbs`<Error::Message @status={{this.status}} />`);
    assert.equal(
      find('.rose-message-title').textContent.trim(),
      'You are not signed in'
    );
    assert.equal(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 401'
    );
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'You are not authenticated. Please authenticate and try again later.'
    );
  });

  test('it renders default error for undefined error status', async function (assert) {
    this.set('status', '510');

    await render(hbs`<Error::Message @status={{this.status}} />`);
    assert.equal(
      find('.rose-message-title').textContent.trim(),
      'Something went wrong'
    );
    assert.equal(find('.rose-message-subtitle').textContent.trim(), 'Error');
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'Please contact your administrator or try again later.'
    );
  });
});
