import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/radio/group', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" as |radioGroup|>
        <radioGroup.radio
          @name="bird"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @name="bird"
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
          @name="bird"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @name="bird"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.false(findAll('[type="radio"]')[0].checked);
    assert.true(findAll('[type="radio"]')[1].checked);

    await click(findAll('[type="radio"]')[0]);

    assert.true(findAll('[type="radio"]')[0].checked);
    assert.false(findAll('[type="radio"]')[1].checked);
  });

  test('it reflects active radiofield value in @selectedValue and triggers a @changed function', async function (assert) {
    assert.expect(5);
    this.changed = (value) => assert.ok(value);
    await render(hbs`
      <Rose::Form::Radio::Group
        @name="bird"
        @selectedValue={{this.selectedValue}}
        @changed={{this.changed}}
      as |radioGroup|>
        <radioGroup.radio
          @name="bird"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @name="bird"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.notOk(this.selectedValue);

    await click(findAll('[type="radio"]')[0]);
    assert.equal(this.selectedValue, 'pegion');

    await click(findAll('[type="radio"]')[1]);
    assert.equal(this.selectedValue, 'flamingo');
  });

  test('it uses @selectedValue value to set active radiofield', async function (assert) {
    this.set('selectedValue', 'cat');
    await render(hbs`
      <Rose::Form::Radio::Group @name="bird" @selectedValue={{this.selectedValue}} as |radioGroup|>
        <radioGroup.radio
          @name="bird"
          @label="Pegion"
          @value="pegion"
        />
        <radioGroup.radio
          @name="bird"
          @label="flamingo"
          @value="flamingo"
        />
      </Rose::Form::Radio::Group>
    `);

    assert.false(findAll('[type="radio"]')[0].checked);
    assert.false(findAll('[type="radio"]')[1].checked);

    this.set('selectedValue', 'flamingo');
    assert.false(findAll('[type="radio"]')[0].checked);
    assert.true(findAll('[type="radio"]')[1].checked);

    this.set('selectedValue', 'pegion');
    assert.true(findAll('[type="radio"]')[0].checked);
    assert.false(findAll('[type="radio"]')[1].checked);

    this.set('selectedValue', 'dog');
    assert.false(findAll('[type="radio"]')[0].checked);
    assert.false(findAll('[type="radio"]')[1].checked);
  });
});
