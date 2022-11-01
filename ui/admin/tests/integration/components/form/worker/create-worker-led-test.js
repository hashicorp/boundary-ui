import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { v1 } from 'ember-uuid';

module(
  'Integration | Component | form/worker/create-worker-led',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      const featuresService = this.owner.lookup('service:features');
      featuresService.enable('byow-pki-hcp-cluster-id');
      featuresService.disable('byow-pki-upstream');
    });

    test('it correctly populates the cluster id for an hcp dev cluster', async function (assert) {
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};
      const service = { hostname: `${guid}.boundary.hcp.dev` };
      this.owner.register('service:browser-object', service, {
        instantiate: false,
      });

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp int cluster', async function (assert) {
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};
      const service = { hostname: `${guid}.boundary.hcp.to` };
      this.owner.register('service:browser-object', service, {
        instantiate: false,
      });

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp prod cluster', async function (assert) {
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};
      const service = { hostname: `${guid}.boundary.hashicorp.cloud` };
      this.owner.register('service:browser-object', service, {
        instantiate: false,
      });

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it leaves the cluster id as blank for any other url', async function (assert) {
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};
      const service = { hostname: `personal.website.com` };
      this.owner.register('service:browser-object', service, {
        instantiate: false,
      });

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasNoValue();
    });
  }
);
