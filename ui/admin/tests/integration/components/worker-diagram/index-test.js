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
    featuresService.disable(targetWorkerFilterIngress);
    featuresService.disable(targetWorkerFilterHCP);
    assert.expect(1);
    await render(hbs`<WorkerDiagram::SingleFilter />`);

    assert.dom('[data-test-single-filter-egress-off]').isVisible();
  });
});
