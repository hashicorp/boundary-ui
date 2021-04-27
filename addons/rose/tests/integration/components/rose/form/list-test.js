import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`<Rose::Form::List as |list|>
        <list.item as |item|>
          <item.cell />
        </list.item>
        <list.item as |item|>
          <item.cell />
          <item.cell />
        </list.item>
      </Rose::Form::List>
    `);
    assert.ok(find('.rose-form-list'));
    assert.equal(findAll('.rose-form-list-item').length, 2, 'it has two items');
    assert.equal(
      findAll('.rose-form-list-item-cell').length,
      3,
      'it has three item cells'
    );
  });

  test('it supports labeling list', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Form::List @label="Label" />`);
    assert.equal(find('.rose-form-list').getAttribute('aria-label'), 'Label');
  });
});
