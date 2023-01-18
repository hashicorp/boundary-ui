import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram | dual-filter | hcp',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    let featuresService;
    const targetWorkerFilterIngress = 'target-worker-filters-v2-ingress';
    const targetWorkerFilterHCP = 'target-worker-filters-v2-hcp';

    hooks.beforeEach(function () {
      featuresService = this.owner.lookup('service:features');
      featuresService.enable(targetWorkerFilterHCP);
      featuresService.disable(targetWorkerFilterIngress);
    });

    test('it renders the correct language when egressFilter is false and ingress is false', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressFilter={{false}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('HCP worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
    });

    test('it renders the correct language when egressFilter is true and ingress is false', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressFilter={{true}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('HCP worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
    });

    test('it renders the correct language when egressFilter is false and ingress is true', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressFilter={{false}} @ingressFilter={{true}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Ingress worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
    });

    test('it renders the correct language when egressFilter is true and ingress is true', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::DualFilter::Hcp @egressFilter={{true}} @ingressFilter={{true}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Ingress worker');
      assert
        .dom('.ordered-series-diagram-group .ordered-series-diagram-item')
        .hasText('Egress worker');
    });
  }
);
