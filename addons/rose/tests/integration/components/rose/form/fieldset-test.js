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

  // Wrap the rendering in a function to avoid repeat code
  async function renderComponent(noDescription) {
    if (noDescription === true) {
      return render(hbs`
        <Rose::Form::Fieldset>
          <:title>{{this.mockTitle}}</:title>
          <:body>{{this.mockBody}}</:body>
        </Rose::Form::Fieldset>
    `);
    }

    return render(hbs`
      <Rose::Form::Fieldset>
        <:title>{{this.mockTitle}}</:title>
        <:description>{{this.mockDescription}}</:description>
        <:body>{{this.mockBody}}</:body>
      </Rose::Form::Fieldset>
    `);
  }

  test('it renders the full component', async function (assert) {
    assert.expect(4);
    await renderComponent(false);
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

  test('it render with no description', async function (assert) {
    assert.expect(4);
    await renderComponent(true);
    assert.ok(find('.rose-form-fieldset'));
    assert.equal(
      find('.rose-form-fieldset-title').textContent.trim(),
      this.mockTitle
    );
    assert.notOk(find('.rose-form-fieldset-description'));
    assert.equal(
      find('.rose-form-fieldset-body').textContent.trim(),
      this.mockBody
    );
  });

  test('it supports aria description for fieldset', async function (assert) {
    assert.expect(1);
    await renderComponent(false);
    const titleElement = find('.rose-form-fieldset-title');
    const fieldsetElement = find('.rose-form-fieldset');

    assert.equal(
      fieldsetElement.getAttribute('aria-describedby'),
      titleElement.id,
      'Fieldset is described by legend'
    );
  });
});
