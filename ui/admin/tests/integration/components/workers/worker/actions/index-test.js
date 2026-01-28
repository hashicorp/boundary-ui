/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | workers/worker/actions/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      this.set('model', {
        id: 'w_123',
        authorized_actions: ['delete', 'set-worker-tags'],
      });
      this.set('delete', () => {});

      await render(
        hbs`<Workers::Worker::Actions @model={{this.model}} @delete={{this.delete}} />`,
      );
      await click('button');

      assert.dom(this.element).includesText('Remove Worker');
      assert.dom(this.element).includesText('Create New Tags');
    });
  },
);
