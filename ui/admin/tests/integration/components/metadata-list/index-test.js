import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | metadata-list/item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders horizontal (default) with icon, color and text', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <MetadataList as |list|>
        <list.Item
          @icon='arrow-up'
          @color='success'
        >
          Sample text
        </list.Item>
      </MetadataList>
    `);

    assert.dom('[data-test-icon="arrow-up"]').isVisible();
    assert.dom('li.metadata-list-item').hasClass('hds-foreground-success');
    assert.dom('li.metadata-list-item').hasText('Sample text');
  });

  test('it renders vertical with icon, color and text', async function (assert) {
    assert.expect(4);
    await render(hbs`
      <MetadataList @orientation='vertical' as |list|>
        <list.Item
          @icon='arrow-down'
          @color='action'
        >
          Sample text 2
        </list.Item>
      </MetadataList>
    `);

    assert.dom('ul.metadata-list').hasClass('vertical');
    assert.dom('[data-test-icon="arrow-down"]').isVisible();
    assert.dom('li.metadata-list-item').hasClass('hds-foreground-action');
    assert.dom('li.metadata-list-item').hasText('Sample text 2');
  });
});
