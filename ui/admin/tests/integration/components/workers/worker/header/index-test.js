/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | workers/worker/header/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders with the id of the model passed in', async function (assert) {
      this.set('model', { id: 'w_123' });

      await render(hbs`
      <Hds::PageHeader as |PH|>
        <Workers::Worker::Header @model={{this.model}} @header={{PH}}/>
      </Hds::PageHeader>
      `);

      assert.dom(this.element).includesText('w_123');
    });
  },
);
