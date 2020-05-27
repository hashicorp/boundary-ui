import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
        <form.input @label="Input" name="input-field" />
        <form.textarea @label="Textarea" name="textarea-field" />
        <form.select @label="Select" name="select-field" @onChange={{this.select}} />
        <form.checkbox @label="Checkbox" name="checkbox-field" />
        <form.radioGroup @name="radio-group-field" @selectedValue="green" as |radioGroup|>
          <radioGroup.radio
            @id="red-radio"
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
});
