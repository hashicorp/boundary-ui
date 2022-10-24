import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import window from 'ember-window-mock';
import { setupWindowMock } from 'ember-window-mock/test-support';
import { v1 } from 'ember-uuid';
import { getOwner } from '@ember/application';

module(
  'Integration | Component | form/worker/create-worker-led',
  function (hooks) {
    setupRenderingTest(hooks);
    setupWindowMock(hooks);

    hooks.beforeEach(function () {
      const config = getOwner(this).resolveRegistration('config:environment');
      config.featureFlags['byow-pki-hcp-cluster-id'] = true;
      config.featureFlags['byow-pki-upstream'] = false;
    });

    test('it correctly populates the cluster id for an hcp dev cluster', async function (assert) {
      const guid = v1();
      window.location.href = `https://${guid}.boundary.hcp.dev`;
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp int cluster', async function (assert) {
      const guid = v1();
      window.location.href = `https://${guid}.boundary.hcp.to`;
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp prod cluster', async function (assert) {
      const guid = v1();
      window.location.href = `https://${guid}.boundary.hashicorp.cloud`;
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it leaves the cluster id as blank for any other url', async function (assert) {
      window.location.href = `https://personal.website.com/scopes/global/workers/new`;
      this.model = {};
      this.submit = () => {};
      this.refresh = () => {};

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @refresh={{this.refresh}} />`
      );

      assert.dom('[name="cluster_id"]').hasNoValue();
    });
  }
);
