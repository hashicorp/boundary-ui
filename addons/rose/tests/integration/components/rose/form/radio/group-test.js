import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/radio/group', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.equal(findAll('input').length, 2);
    assert.equal(findAll('input')[0].name, 'bird');
    assert.equal(findAll('input')[1].name, 'bird');
  });

  test('it renders with @selectedValue value selected', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" @selectedValue="flamingo" as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.equal(find('#bird-1').checked, false);
    assert.equal(find('#bird-2').checked, true);

    await click(find('#bird-1'));

    assert.equal(find('#bird-1').checked, true);
    assert.equal(find('#bird-2').checked, false);
  });

  test('it reflects active radiofield value in @selectedValue', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" @selectedValue={{this.selectedValue}} as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.notOk(this.selectedValue);

    await click(find('#bird-1'));
    assert.equal(this.selectedValue, 'pegion');

    await click(find('#bird-2'));
    assert.equal(this.selectedValue, 'flamingo');
  });

  test('it uses @selectedValue value to set active radiofield', async function (assert) {
    this.set('selectedValue', 'cat');
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" @selectedValue={{this.selectedValue}} as |radioGroup|>
        <radioGroup.radio
          @id="bird-1"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @id="bird-2"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.equal(find('#bird-1').checked, false);
    assert.equal(find('#bird-2').checked, false);

    this.set('selectedValue', 'flamingo');
    assert.equal(find('#bird-1').checked, false);
    assert.equal(find('#bird-2').checked, true);

    this.set('selectedValue', 'pegion');
    assert.equal(find('#bird-1').checked, true);
    assert.equal(find('#bird-2').checked, false);

    this.set('selectedValue', 'dog');
    assert.equal(find('#bird-1').checked, false);
    assert.equal(find('#bird-2').checked, false);
  });
});
