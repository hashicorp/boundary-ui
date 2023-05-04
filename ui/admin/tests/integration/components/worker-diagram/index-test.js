/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | worker-diagram/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  let featuresService;
  const targetWorkerFilterIngress = 'target-worker-filters-v2-ingress';
  const targetWorkerFilterHCP = 'target-worker-filters-v2-hcp';

  test('it renders a single filter diagram', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    assert.expect(3);
    await render(hbs`<WorkerDiagram />`);
    assert.false(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.false(featuresService.isEnabled(targetWorkerFilterHCP));
    assert.dom('[data-test-single-filter-egress-off]').isVisible();
  });

  test('it renders a dual filter diagram when `target-worker-filters-v2-ingress` is enabled', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    featuresService.enable(targetWorkerFilterIngress);
    assert.expect(3);
    assert.true(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.false(featuresService.isEnabled(targetWorkerFilterHCP));
    await render(hbs`<WorkerDiagram />`);

    assert.dom('[data-test-dual-filter-egress-off-ingress-off]').isVisible();
  });

  test('it renders an HCP dual filter diagram when `target-worker-filters-v2-hcp` is enabled', async function (assert) {
    featuresService = this.owner.lookup('service:features');
    featuresService.enable(targetWorkerFilterIngress);
    featuresService.enable(targetWorkerFilterHCP);
    assert.expect(3);
    await render(hbs`<WorkerDiagram />`);
    assert.true(featuresService.isEnabled(targetWorkerFilterIngress));
    assert.true(featuresService.isEnabled(targetWorkerFilterHCP));
    assert
      .dom('[data-test-dual-filter-hcp-egress-off-ingress-off]')
      .isVisible();
  });
});
