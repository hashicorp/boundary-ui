/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | worker-diagram/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  let featuresService;
  const targetWorkerFilterIngress = 'worker-filter';
  const targetWorkerFilterHCP = 'worker-filter-hcp';

  test('it renders a single filter diagram', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    await render(hbs`<WorkerDiagram />`);
    assert.false(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.false(featuresService.isEnabled(targetWorkerFilterHCP));
    assert.dom('[data-test-single-filter-egress-off]').isVisible();
  });

  test('it renders a dual filter diagram when `worker-filter` is enabled', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    featuresService.enable(targetWorkerFilterIngress);
    assert.true(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.false(featuresService.isEnabled(targetWorkerFilterHCP));
    await render(hbs`<WorkerDiagram />`);

    assert.dom('[data-test-dual-filter-egress-off-ingress-off]').isVisible();
  });

  test('it renders an HCP dual filter diagram when `worker-filter-hcp` is enabled', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    featuresService.enable(targetWorkerFilterIngress);
    featuresService.enable(targetWorkerFilterHCP);
    await render(hbs`<WorkerDiagram />`);
    assert.true(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.true(featuresService.isEnabled(targetWorkerFilterHCP));
    assert
      .dom('[data-test-dual-filter-hcp-egress-off-ingress-off]')
      .isVisible();
  });
});
