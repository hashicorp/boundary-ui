import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/dropdown', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown />`);
    assert.ok(await find('.rose-dropdown'));
  });

  test('it renders with label', async function (assert) {
    await render(hbs`<Rose::Dropdown @label="Label"/>`);
    assert.equal(
      await find('.rose-dropdown-label').textContent.trim(),
      'Label'
    );
  });

  test('it renders with dropdown icon', async function (assert) {
    await render(hbs`<Rose::Dropdown @icon="chev"/>`);
    assert.ok(await find('.rose-dropdown-icon-chevron'));
  });

  test('it renders without dropdown icon when @hideIcon={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown @hideIcon={{true}}/>`);
    assert.notOk(await find('.rose-dropdown-icon-chevron'));
  });

  test('it renders with user icon when @icon="user"', async function (assert) {
    await render(hbs`<Rose::Dropdown @icon="user"/>`);
    assert.ok(await find('.rose-dropdown-icon-user'));
    assert.ok(await find('.rose-dropdown-icon-chevron'));
  });

  test('it renders only with user icon when @icon="user" and @hideIcon={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown @icon="user" @hideIcon={{true}}/>`);
    assert.ok(await find('.rose-dropdown-icon-user'));
    assert.notOk(await find('.rose-dropdown-icon-chevron'));
  });

  test('it displays dropdown items on label click action', async function (assert) {
    await render(hbs`<Rose::Dropdown @label="Label"  as |dropdown|>
      <dropdown.option>Dropdown Item</dropdown.option>
      <dropdown.option>Dropdown Item</dropdown.option>
    </Rose::Dropdown>`);

    await click(find('.rose-dropdown-label'));
    assert.equal(await findAll('.rose-dropdown-item').length, 2);
  });

  test('it closes dropdown items on every other label click action', async function (assert) {
    await render(hbs`<Rose::Dropdown @label="Label"  as |dropdown|>
      <dropdown.option>Dropdown Item</dropdown.option>
      <dropdown.option>Dropdown Item</dropdown.option>
    </Rose::Dropdown>`);

    await click(find('.rose-dropdown-label'));
    assert.equal(await findAll('.rose-dropdown-item').length, 2);
    await click(find('.rose-dropdown-label'));
    assert.equal(await findAll('.rose-dropdown-item').length, 0);
  });

  test('it closes dropdown items on external click action', async function (assert) {
    await render(hbs`<Rose::Dropdown @label="Label"  as |dropdown|>
      <dropdown.option>Dropdown Item</dropdown.option>
      <dropdown.option>Dropdown Item</dropdown.option>
    </Rose::Dropdown>`);

    await click(find('.rose-dropdown-label'));
    assert.equal(await findAll('.rose-dropdown-item').length, 2);
    await click(find('.rose-dropdown'));
    assert.equal(await findAll('.rose-dropdown-item').length, 0);
  });
});
