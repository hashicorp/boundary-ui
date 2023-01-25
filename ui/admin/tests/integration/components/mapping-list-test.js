import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | mapping-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders fields', async function (assert) {
    await render(hbs`
        <MappingList as |M|>
          <M.Legend>Label</M.Legend>
          <M.HelperText>Help</M.HelperText>
          <M.Error as |E|>
            <E.Message>Error!</E.Message>
          </M.Error>
        </MappingList>
    `);

    assert.dom('ul li').exists({ count: 1 });
    assert.dom('legend').exists().hasText('Label');
    assert.dom('.hds-form-helper-text').exists().hasText('Help');
    assert.dom('.hds-form-error__message').exists().hasText('Error!');
    assert.dom('button').exists().hasText('Add');
  });

  test('it renders multiple options', async function (assert) {
    this.options = [
      { key: 'one', value: 'two' },
      { key: 'three', value: 'four' },
    ];

    // Template block usage:
    await render(hbs`
        <MappingList
            @options={{this.options}}
        />
    `);

    assert.dom('ul li').exists({ count: 3 });
  });
});
