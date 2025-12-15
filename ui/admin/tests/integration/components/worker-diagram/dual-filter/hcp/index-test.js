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
  'Integration | Component | worker-diagram | dual-filter | hcp',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    let featuresService;
    const targetWorkerFilterHCP = 'worker-filter-hcp';

    hooks.beforeEach(function () {
      featuresService = this.owner.lookup('service:features');
      featuresService.enable(targetWorkerFilterHCP);
    });

    test('it renders the correct diagram when egress and ingress filter is false', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressWorkerFilterEnabled={{false}} @ingressWorkerFilterEnabled={{false}} />`,
      );

      assert.dom('[data-test-dual-filter-hcp-egress-off-ingress-off]').exists();
    });

    test('it renders the correct diagram when egress filter is true and ingress filter is false', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressWorkerFilterEnabled={{true}} @ingressWorkerFilterEnabled={{false}} />`,
      );

      assert.dom('[data-test-dual-filter-hcp-egress-on-ingress-off]').exists();
    });

    test('it renders the correct diagram when egress filter is false and ingress filter is true', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressWorkerFilterEnabled={{false}} @ingressWorkerFilterEnabled={{true}} />`,
      );

      assert.dom('[data-test-dual-filter-hcp-egress-off-ingress-on]').exists();
    });

    test('it renders the correct diagram when egress and ingress filter is true', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressWorkerFilterEnabled={{true}} @ingressWorkerFilterEnabled={{true}} />`,
      );

      assert.dom('[data-test-dual-filter-hcp-egress-on-ingress-on]').exists();
    });
  },
);
