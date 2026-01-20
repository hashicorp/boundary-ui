/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram/single-filter',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders the correct diagram when egress filter is false', async function (assert) {
      await render(
        hbs`<WorkerDiagram::SingleFilter @egressWorkerFilterEnabled={{false}} />`,
      );

      assert.dom('[data-test-single-filter-egress-off]').isVisible();
      assert.dom('[data-test-single-filter-egress-on]').doesNotExist();
    });

    test('it renders the correct diagram when egress filter is true', async function (assert) {
      await render(
        hbs`<WorkerDiagram::SingleFilter @egressWorkerFilterEnabled={{true}} />`,
      );

      assert.dom('[data-test-single-filter-egress-on]').isVisible();
      assert.dom('[data-test-single-filter-egress-off]').doesNotExist();
    });
  },
);
