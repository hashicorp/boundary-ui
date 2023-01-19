import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram | dual-filter',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    let featuresService;
    const targetWorkerFilterIngress = 'target-worker-filters-v2-ingress';
    const targetWorkerFilterHCP = 'target-worker-filters-v2-hcp';

    hooks.beforeEach(function () {
      featuresService = this.owner.lookup('service:features');
      featuresService.enable(targetWorkerFilterIngress);
      featuresService.disable(targetWorkerFilterHCP);
    });

    test('it renders the correct diagram when egressFilter is false and ingress is false', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{false}} />`
      );

      assert.dom('[data-test-dual-filter-egress-off-ingress-off]').exists();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is false', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{false}} />`
      );

      assert.dom('[data-test-dual-filter-egress-on-ingress-off]').exists();
    });

    test('it renders the correct diagram when egressFilter is false and ingress is true', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{true}} />`
      );

      assert.dom('[data-test-dual-filter-egress-off-ingress-on]').exists();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is true', async function (assert) {
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{true}} />`
      );

      assert.dom('[data-test-dual-filter-egress-on-ingress-on]').exists();
    });
  }
);
