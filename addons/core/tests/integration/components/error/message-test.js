import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | error/message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders predefined message for known error status', async function (assert) {
    await render(hbs`<Error::Message @status='401' />`);
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
    await render(hbs`<Error::Message @status='403' />`);
    assert.equal(
      find('.rose-message-title').textContent.trim(),
      'You are not authorized'
    );
    assert.equal(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 403'
    );
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'You must be granted permissions to view this data. Ask your administrator if you think you should have access.'
    );
    await render(hbs`<Error::Message @status='404' />`);
    assert.equal(
      find('.rose-message-title').textContent.trim(),
      'Resource not found'
    );
    assert.equal(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 404'
    );
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'We could not find the requested resource. You can ask your administrator or try again later.'
    );
  });

  test('it renders default error for unknown error status', async function (assert) {
    await render(hbs`<Error::Message @status='599' />`);
    assert.equal(
      find('.rose-message-title').textContent.trim(),
      'Something went wrong'
    );
    assert.equal(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 599'
    );
    assert.equal(
      find('.rose-message-description').textContent.trim(),
      'We\'re not sure what happened.  Please contact your administrator or try again later.'
    );
  });
});
