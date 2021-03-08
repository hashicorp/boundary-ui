import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
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

  test('it can render contextual form components', async function (assert) {
    assert.expect(5);
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
        <form.input @label="Input" @name="input-field" />
        <form.textarea @label="Textarea" @name="textarea-field" />
        <form.select
          @label="Select"
          @name="select-field"
          @onChange={{this.select}}
          as |field|
        >
          <field.field />
        </form.select>
        <form.checkbox @label="Checkbox" @name="checkbox-field" />
        <form.radioGroup @name="radio-group-field" @selectedValue="green" as |radioGroup|>
          <radioGroup.radio
            @label="Red"
            @value="red"
          />
        </form.radioGroup>
      </Rose::Form>
    `);
    assert.ok(find('[name="input-field"]'));
    assert.ok(find('[name="textarea-field"]'));
    assert.ok(find('[name="select-field"]'));
    assert.ok(find('[name="checkbox-field"]'));
    assert.ok(find('[name="radio-group-field"]'));
  });

  test('it supports an editability toggle when @showEditToggle is true', async function (assert) {
    assert.expect(12);
    this.cancel = () => {
      assert.ok(
        true,
        'cancel function may still be passed even for @showEditToggle'
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
        <form.input @label="Label" @value="value" />
        <form.actions
          @submitText="Save"
          @cancelText="Cancel"
          @enableEditText="Edit" />
      </Rose::Form>
    `);
    // Before enabling edit mode, fields are disabled and the edit mode button is displayed
    assert.ok(find('.rose-form'));
    assert.equal(findAll('input[disabled]').length, 1);
    assert.equal(findAll('button').length, 1);
    assert.equal(find('button').textContent.trim(), 'Edit');
    // After entering edit mode, fields are enabled and save/cancel buttons are displayed
    await click('button');
    assert.equal(findAll('input[disabled]').length, 0);
    assert.equal(findAll('button').length, 2);
    assert.equal(find('[type="submit"]').textContent.trim(), 'Save');
    assert.equal(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel'
    );
    // After canceling, fields are disabled again and the edit mode button is displayed
    await click('button:not([type="submit"])');
    assert.equal(findAll('input[disabled]').length, 1);
    assert.equal(findAll('button').length, 1);
    assert.equal(find('button').textContent.trim(), 'Edit');
  });

  test('it re-enables read-only mode if the submit handler returns a resolving promise', async function (assert) {
    assert.expect(15);
    this.cancel = () => {};
    await render(hbs`
      <Rose::Form
        @onSubmit={{this.submit}}
        @cancel={{this.cancel}}
        @showEditToggle={{true}}
        as |form|
      >
        <form.input @label="Label" @value="value" />
        <form.actions
          @submitText="Save"
          @cancelText="Cancel"
          @enableEditText="Edit" />
      </Rose::Form>
    `);
    // Before enabling edit mode, fields are disabled and the edit mode button is displayed
    assert.ok(find('.rose-form'));
    assert.equal(findAll('input[disabled]').length, 1);
    assert.equal(findAll('button').length, 1);
    assert.equal(find('button').textContent.trim(), 'Edit');
    // After entering edit mode, fields are enabled and save/cancel buttons are displayed
    await click('button');
    assert.equal(findAll('input[disabled]').length, 0);
    assert.equal(findAll('button').length, 2);
    assert.equal(find('[type="submit"]').textContent.trim(), 'Save');
    assert.equal(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel'
    );
    // After saving with failure, fields are enabled and save/cancel buttons are displayed
    this.submit = () => reject();
    assert.equal(findAll('input[disabled]').length, 0);
    assert.equal(findAll('button').length, 2);
    assert.equal(find('[type="submit"]').textContent.trim(), 'Save');
    assert.equal(
      find('button:not([type="submit"])').textContent.trim(),
      'Cancel'
    );
    // After saving with success, fields are disabled again and the edit mode button is displayed
    this.submit = () => resolve();
    await click('button[type="submit"]');
    assert.equal(findAll('input[disabled]').length, 1);
    assert.equal(findAll('button').length, 1);
    assert.equal(find('button').textContent.trim(), 'Edit');
  });
});
