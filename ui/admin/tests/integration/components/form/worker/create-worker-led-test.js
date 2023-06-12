/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { v1 } from 'ember-uuid';
import { setupIntl } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module(
  'Integration | Component | form/worker/create-worker-led',
  function (hooks) {
    setupRenderingTest(hooks);
    setupBrowserFakes(hooks, { window: true });
    setupIntl(hooks);

    hooks.beforeEach(function () {
      const featuresService = this.owner.lookup('service:features');
      featuresService.enable('byow-pki-hcp-cluster-id');
    });

    test('it correctly populates the cluster id for an hcp dev cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hcp.dev`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp int cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hcp.to`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp prod cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = v1();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hashicorp.cloud`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it leaves the cluster id as blank for any other url', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `personal.website.com`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`
      );

      assert.dom('[name="cluster_id"]').hasNoValue();
    });
  }
);
