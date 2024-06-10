/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | filter-tags/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    this.set('filter', {
      allFilters: { scopes: [{ id: '1', name: 'Project 1' }] },
      selectedFilters: { scopes: ['1'] },
    });
    await render(hbs`<FilterTags @filters={{this.filter}} />`);

    assert.dom('.hds-tag__text').hasText('Project 1');
  });
});
