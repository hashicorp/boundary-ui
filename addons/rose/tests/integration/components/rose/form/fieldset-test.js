/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

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
    await renderComponent(false);
    assert.ok(find('.rose-form-fieldset'));
    assert.strictEqual(
      find('.rose-form-fieldset-title').textContent.trim(),
      this.mockTitle,
    );
    assert.strictEqual(
      find('.rose-form-fieldset-description').textContent.trim(),
      this.mockDescription,
    );
    assert.strictEqual(
      find('.rose-form-fieldset-body').textContent.trim(),
      this.mockBody,
    );
  });

  test('it renders with no description', async function (assert) {
    await renderComponent(true);
    assert.ok(find('.rose-form-fieldset'));
    assert.strictEqual(
      find('.rose-form-fieldset-title').textContent.trim(),
      this.mockTitle,
    );
    assert.notOk(find('.rose-form-fieldset-description'));
    assert.strictEqual(
      find('.rose-form-fieldset-body').textContent.trim(),
      this.mockBody,
    );
  });

  test('it supports aria description for fieldset with description provided', async function (assert) {
    await renderComponent(false);
    const descriptionElement = find('.rose-form-fieldset-description');
    const fieldsetElement = find('.rose-form-fieldset');

    assert.strictEqual(
      fieldsetElement.getAttribute('aria-describedby'),
      descriptionElement.id,
      'Fieldset is described by description',
    );
  });

  test('it does not support aria description for fieldset with no description provided', async function (assert) {
    await renderComponent(true);
    const fieldsetElement = find('.rose-form-fieldset');

    assert.ok(find('.rose-form-fieldset'));
    assert.notOk(find('.rose-form-fieldset-description'));
    assert.notOk(fieldsetElement.getAttribute('aria-describedby'));
  });
});
