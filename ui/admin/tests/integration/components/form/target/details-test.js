import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, getContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form/target/details', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  let featuresService;

  hooks.beforeEach(function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
    this.model = { type: 'ssh' };
    this.submit = () => {};
    this.cancel = () => {};
    this.changeType = () => {};
  });

  test('shows the correct worker diagram when `target-worker-filters-v2` is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.disable('target-worker-filters-v2-ingress');
    featuresService.disable('target-worker-filters-v2-hcp');
    assert.expect(1);
    await render(
      hbs`<Form::Target::Details @model={{this.model}} @defaultPort='22' @submit={{this.submit}} @cancel={{this.cancel}} @changeType={{this.changeType}} />`
    );

    assert.dom('[data-test-single-filter-egress-off]').isVisible();
  });

  test('shows the correct worker diagram when `target-worker-filters-v2` and `target-worker-filters-v2-ingress` is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    featuresService.disable('target-worker-filters-v2-hcp');
    assert.expect(1);
    await render(
      hbs`<Form::Target::Details @model={{this.model}} @defaultPort='22' @submit={{this.submit}} @cancel={{this.cancel}} @changeType={{this.changeType}} />`
    );

    assert.dom('[data-test-dual-filters]').isVisible();
  });

  test('shows the correct worker diagram when `target-worker-filters-v2` and `target-worker-filters-v2-ingress` and `target-worker-filters-v2-hcp` is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    featuresService.enable('target-worker-filters-v2-hcp');
    assert.expect(1);
    await render(
      hbs`<Form::Target::Details @model={{this.model}} @defaultPort='22' @submit={{this.submit}} @cancel={{this.cancel}} @changeType={{this.changeType}} />`
    );

    assert.dom('[data-test-dual-filters-hcp]').isVisible();
  });
});
