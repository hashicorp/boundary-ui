/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/metadata-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders horizontal (default) with icon, color and text', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <Rose::MetadataList as |list|>
        <list.Item
          @icon='arrow-up'
          @color='success'
        >
          Sample text
        </list.Item>
      </Rose::MetadataList>
    `);

    assert.dom('[data-test-icon="arrow-up"]').isVisible();
    assert.dom('li.rose-metadata-list-item').hasClass('hds-foreground-success');
    assert.dom('li.rose-metadata-list-item').hasText('Sample text');
  });

  test('it renders vertical with icon, color and text', async function (assert) {
    assert.expect(4);
    await render(hbs`
      <Rose::MetadataList @orientation='vertical' as |list|>
        <list.Item
          @icon='arrow-down'
          @color='action'
        >
          Sample text 2
        </list.Item>
      </Rose::MetadataList>
    `);

    assert.dom('ul.rose-metadata-list').hasClass('vertical');
    assert.dom('[data-test-icon="arrow-down"]').isVisible();
    assert.dom('li.rose-metadata-list-item').hasClass('hds-foreground-action');
    assert.dom('li.rose-metadata-list-item').hasText('Sample text 2');
  });

  test('it renders no icon if @icon not provided', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::MetadataList as |list|>
        <list.Item
          @color='action'
        >
          Sample text 3
        </list.Item>
      </Rose::MetadataList>
    `);

    assert.dom('.hds-icon').isNotVisible();
    assert.dom('li.rose-metadata-list-item').hasText('Sample text 3');
  });
});
