import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import {
  disableFeature,
  enableFeature,
} from '../../../helpers/features-service';

module('Integration | Component | worker-diagram/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  const targetWorkerFilterIngress = 'target-worker-filters-v2-ingress';
  const targetWorkerFilterHCP = 'target-worker-filters-v2-hcp';

  test('it renders a single filter diagram', async function (assert) {
    disableFeature(targetWorkerFilterIngress);
    disableFeature(targetWorkerFilterHCP);
    assert.expect(1);
    await render(hbs`<WorkerDiagram />`);

    assert.dom('[data-test-single-filter-egress-off]').isVisible();
  });

  test('it renders a dual filter diagram when `target-worker-filters-v2-ingress` is enabled', async function (assert) {
    enableFeature(targetWorkerFilterIngress);
    disableFeature(targetWorkerFilterHCP);
    assert.expect(1);
    await render(hbs`<WorkerDiagram />`);

    assert.dom('[data-test-dual-filter-egress-off-ingress-off]').isVisible();
  });

  test('it renders a HCP dual filter diagram when `target-worker-filters-v2-hcp` is enabled', async function (assert) {
    enableFeature(targetWorkerFilterIngress);
    enableFeature(targetWorkerFilterHCP);
    assert.expect(1);
    await render(hbs`<WorkerDiagram />`);

    assert
      .dom('[data-test-dual-filter-hcp-egress-off-ingress-off]')
      .isVisible();
  });
});
