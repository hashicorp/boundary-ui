import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram/dual-filter',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders the correct diagram when egressFilter is false and ingress is false', async function (assert) {
      assert.expect(4);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{false}} />`
      );

      assert.dom('[data-test-egress-ingress-off]').isVisible();
      assert.dom('[data-test-egress-on]').doesNotExist();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is true and ingress is false', async function (assert) {
      assert.expect(4);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{true}} @ingressFilter={{false}} />`
      );

      assert.dom('[data-test-egress-on]').isVisible();
      assert.dom('[data-test-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-on]').doesNotExist();
      assert.dom('[data-test-egress-ingress-off]').doesNotExist();
    });

    test('it renders the correct diagram when egressFilter is false and ingress is true', async function (assert) {
      assert.expect(4);
      await render(
        hbs`<WorkerDiagram::DualFilter @egressFilter={{false}} @ingressFilter={{true}} />`
      );

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
