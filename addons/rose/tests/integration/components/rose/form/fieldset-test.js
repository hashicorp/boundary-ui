import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/fieldset', function (hooks) {
  setupRenderingTest(hooks);

  // Global values for mocking
  this.mockTitle = 'Title';
  this.mockDescription = 'Description';
  this.mockBody = 'Rest of the form';

  hooks.beforeEach(async function () {
    // Render the component before each test
    await render(hbs`
      <Rose::Form::Fieldset>
        <:title>{{this.mockTitle}}</:title>
        <:description>{{this.mockDescription}}</:description>
        <:body>{{this.mockBody}}</:body>
      </Rose::Form::Fieldset>
    `);
  });

  test('it renders', async function (assert) {
    assert.expect(4);
    assert.ok(find('.rose-form-fieldset'));
    assert.equal(
      find('.rose-form-fieldset-title').textContent.trim(),
      this.mockTitle
    );
    assert.equal(
      find('.rose-form-fieldset-description').textContent.trim(),
      this.mockDescription
    );
    assert.equal(
      find('.rose-form-fieldset-body').textContent.trim(),
      this.mockBody
    );
  });

  test('it supports aria description for title', async function (assert) {
    assert.expect(2);
    const titleElement = find('.rose-form-fieldset-title');
    const descriptionElement = find('.rose-form-fieldset-description');

    assert.equal(
      titleElement.getAttribute('aria-describedBy'),
      descriptionElement.id,
      'Title is described by description'
    );

    assert.equal(
      descriptionElement.getAttribute('aria-labelledBy'),
      titleElement.id,
      'Description is labelled by title'
    );
  });
});
