/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setFromEvent } from 'rose/helpers/set-from-event';

module('Integration | Helper | set-from-event', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns a function that sets the specified value to event.target.value', async function (assert) {
    assert.expect(2);
    this.set('inputValue', '1234');
    assert.deepEqual(this.inputValue, '1234');
    const handler = setFromEvent([this, 'inputValue']);
    handler({ target: { value: 'foobar' } });
    assert.deepEqual(this.inputValue, 'foobar');
  });

  test('it can be used with the on modifier to set a specified field with the value of event.target.value', async function (assert) {
    assert.expect(2);
    this.set('inputValue', '1234');
    await render(
      hbs`<button value="foobar" type="button" {{on 'click' (set-from-event this 'inputValue')}} />`,
    );
    assert.deepEqual(this.inputValue, '1234');
    await click('button');
    assert.deepEqual(this.inputValue, 'foobar');
  });

  test('it can be used in an HDS select element to set a specified field with the value of the selected option', async function (assert) {
    assert.expect(3);
    this.set('selectedValue', 'blue');
    await render(hbs`
      <Hds::Form::Select::Field
        @value={{this.selectedValue}}
        @isInvalid={{false}}
        disabled={{false}}
        name='select_name'
        {{on 'change' (set-from-event this 'selectedValue')}}
        as |F|
      >
        <F.Options>
          <option>Choose a color</option>
          <option value='red' selected={{eq this.selectedValue 'red'}}>Red</option>
          <option value='green' selected={{eq this.selectedValue 'green'}}>Green</option>
          <option value='blue' selected={{eq this.selectedValue 'blue'}}>Blue</option>
        </F.Options>
      </Hds::Form::Select::Field>
    `);
    assert.deepEqual(this.selectedValue, 'blue');
    await select('[name=select_name]', 'green');
    assert.deepEqual(this.selectedValue, 'green');
    await select('[name=select_name]', 'red');
    assert.deepEqual(this.selectedValue, 'red');
  });
});
