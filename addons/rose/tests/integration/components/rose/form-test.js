/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { resolve, reject } from 'rsvp';

module('Integration | Component | rose/form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and handles submit/cancel actions', async function (assert) {
    assert.expect(3);
    this.submit = () => assert.ok(true, 'submitted');
    this.cancel = () => assert.ok(true, 'cancelled');
    await render(hbs`
      <Rose::Form
        @onSubmit={{this.submit}}
        @cancel={{this.cancel}}
        @disabled={{false}}
        as |form|
      >
        <form.actions
          @submitText="Save"
          @cancelText="Cancel" />
      </Rose::Form>
    `);
    assert.ok(find('.rose-form'));
    await click('[type="submit"]');
    await click('button:not([type="submit"])');
  });

  test('it yields child form components', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.select = () => {};
    await render(hbs`
      <Rose::Form
        @onSubmit={{this.submit}}
        @cancel={{this.cancel}}
        @disabled={{false}}
        as |form|
      >
        <Hds::Form::Textarea::Field
          @value="This is my description"
          name="textarea-field"
          disabled={{form.disabled}}
          as |F|>
          <F.Label>Short description</F.Label>
          <F.HelperText>Add a short description about the workspace you are creating.</F.HelperText>
        </Hds::Form::Textarea::Field>

        <Hds::Form::Select::Field
          @isInvalid={{false}}
          disabled={{form.disabled}}
          name='select-field'
          {{on 'change' (set-from-event this 'selectedValue')}}
          as |F|
        >
          <F.Label>Select</F.Label>
          <F.HelperText>Helper text</F.HelperText>
          <F.Options>
            <option>Choose an option</option>
            <option value='value-1'>Value 1</option>
            <option value='value-2'>Value 2</option>
            <option value='value-3'>Value 3</option>
          </F.Options>
        </Hds::Form::Select::Field>

        <form.checkbox @label="Checkbox" @name="checkbox-field" />
      </Rose::Form>
    `);
    assert.ok(find('[name="textarea-field"]'));
    assert.ok(find('[name="select-field"]'));
    assert.ok(find('[name="checkbox-field"]'));
  });

  test('it supports an editability toggle when @showEditToggle is true', async function (assert) {
    assert.expect(12);
    this.cancel = () => {
      assert.ok(
        true,
        'cancel function may still be passed even for @showEditToggle',
      );
    };
    this.submit = () => {};
    await render(hbs`
      <Rose::Form
        @onSubmit={{this.submit}}
        @cancel={{this.cancel}}
        @showEditToggle={{true}}
        as |form|
      >
        <form.actions
          @submitText="Save"
          @cancelText="Cancel"
          @enableEditText="Edit" />
      </Rose::Form>
    `);
    // Before enabling edit mode, fields are disabled and the edit mode button is displayed
    assert.ok(find('.rose-form'));
    assert.strictEqual(findAll('button').length, 1);
    assert.strictEqual(find('button').textContent.trim(), 'Edit');
    // After entering edit mode, fields are enabled and save/cancel buttons are displayed
    await click('button');
    assert.strictEqual(findAll('button').length, 2);
    assert.strictEqual(find('[type="submit"]').textContent.trim(), 'Save');
    assert.strictEqual(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel',
    );
    // After canceling, fields are disabled again and the edit mode button is displayed
    await click('button:not([type="submit"])');
    assert.strictEqual(findAll('button').length, 1);
    assert.strictEqual(find('button').textContent.trim(), 'Edit');
  });

  test('it re-enables read-only mode if the submit handler returns a resolving promise', async function (assert) {
    this.cancel = () => {};
    await render(hbs`
      <Rose::Form
        @onSubmit={{this.submit}}
        @cancel={{this.cancel}}
        @showEditToggle={{true}}
        as |form|
      >
        <form.actions
          @submitText="Save"
          @cancelText="Cancel"
          @enableEditText="Edit" />
      </Rose::Form>
    `);
    // Before enabling edit mode, fields are disabled and the edit mode button is displayed
    assert.ok(find('.rose-form'));
    assert.strictEqual(findAll('button').length, 1);
    assert.strictEqual(find('button').textContent.trim(), 'Edit');
    // After entering edit mode, fields are enabled and save/cancel buttons are displayed
    await click('button');
    assert.strictEqual(findAll('button').length, 2);
    assert.strictEqual(find('[type="submit"]').textContent.trim(), 'Save');
    assert.strictEqual(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel',
    );
    // After saving with failure, fields are enabled and save/cancel buttons are displayed
    this.submit = () => reject();
    assert.strictEqual(findAll('button').length, 2);
    assert.strictEqual(find('[type="submit"]').textContent.trim(), 'Save');
    assert.strictEqual(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel',
    );
    // After saving with success, fields are disabled again and the edit mode button is displayed
    this.submit = () => resolve();
    await click('button[type="submit"]');
    assert.strictEqual(findAll('button').length, 1);
    assert.strictEqual(find('button').textContent.trim(), 'Edit');
  });
});
