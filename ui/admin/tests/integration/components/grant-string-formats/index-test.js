import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | grant-string-formats/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    const RESOURCE_TYPE_OPTION = '[value="resource-type"]';
    const RESOURCE_OPTION = '[value="resource"]';
    const PINNED_ID_OPTION = '[value="pinned-id"]';
    const STRING_FORMAT_FIELD = '[name="string-format"]';

    test('it renders string format with resource type by default', async function (assert) {
      await render(hbs`<GrantStringFormats />`);

      assert.dom(RESOURCE_TYPE_OPTION).isChecked();
      assert.dom(RESOURCE_OPTION).isNotChecked();
      assert.dom(PINNED_ID_OPTION).isNotChecked();
      assert
        .dom(STRING_FORMAT_FIELD)
        .hasValue('type=<insert resource types>;actions=<insert actions>');
    });

    test('it renders string format when type is changed to specific resource', async function (assert) {
      await render(hbs`<GrantStringFormats />`);

      await click(RESOURCE_OPTION);

      assert.dom(RESOURCE_OPTION).isChecked();
      assert.dom(RESOURCE_TYPE_OPTION).isNotChecked();
      assert.dom(PINNED_ID_OPTION).isNotChecked();
      assert
        .dom(STRING_FORMAT_FIELD)
        .hasValue('id=<insert resource ids>;actions=<insert actions>');
    });

    test('it renders string format when type is changed to pinned id', async function (assert) {
      await render(hbs`<GrantStringFormats />`);

      await click(PINNED_ID_OPTION);

      assert.dom(PINNED_ID_OPTION).isChecked();
      assert.dom(RESOURCE_TYPE_OPTION).isNotChecked();
      assert.dom(RESOURCE_OPTION).isNotChecked();
      assert
        .dom(STRING_FORMAT_FIELD)
        .hasValue(
          'id=<insert id>;type=<insert resource types>;actions=<insert actions>',
        );
    });
  },
);
