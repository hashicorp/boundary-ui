import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram/dual-filter Enterprise',
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
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Front line worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('HCP worker');
      assert.dom('[data-test-egress-ingress-off]').isVisible();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is false', async function (assert) {
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Front line worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('HCP worker');
      assert.dom('[data-test-egress-on]').isVisible();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is false and ingress is true', async function (assert) {
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{true}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Front line worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Ingress worker');
      assert.dom('[data-test-ingress-on]').isVisible();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is true', async function (assert) {
      assert.expect(4);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{true}} />`
      );

      assert.dom('[data-test-egress-ingress-on]').isVisible();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });
  }
);

module(
  'Integration | Component | worker-diagram/dual-filter HCP',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    let featuresService;
    const targetWorkerFilterIngress = 'target-worker-filters-v2-ingress';
    const targetWorkerFilterHCP = 'target-worker-filters-v2-hcp';

    hooks.beforeEach(function () {
      featuresService = this.owner.lookup('service:features');
      featuresService.enable(targetWorkerFilterIngress);
      featuresService.enable(targetWorkerFilterHCP);
    });

    test('it renders the correct diagram when egressFilter is false and ingress is false', async function (assert) {
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('HCP worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
      assert.dom('[data-test-egress-ingress-off]').isVisible();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is false', async function (assert) {
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{false}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('HCP worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
      assert.dom('[data-test-egress-on]').isVisible();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is false and ingress is true', async function (assert) {
      assert.expect(6);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{true}} />`
      );

      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .hasText('Ingress worker');
      assert
        .dom('.ordered-series-diagram-item:nth-child(2)')
        .doesNotIncludeText('Front line worker');
      assert.dom('[data-test-ingress-on]').isVisible();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is true', async function (assert) {
      assert.expect(4);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{true}} />`
      );

      assert.dom('[data-test-egress-ingress-on]').isVisible();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });
  }
);
