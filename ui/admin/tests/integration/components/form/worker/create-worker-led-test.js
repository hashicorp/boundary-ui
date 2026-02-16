/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { v4 as uuidv4 } from 'uuid';
import { setupIntl } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module(
  'Integration | Component | form/worker/create-worker-led',
  function (hooks) {
    setupRenderingTest(hooks);
    setupBrowserFakes(hooks, { window: true });
    setupIntl(hooks, 'en-us');

    hooks.beforeEach(function () {
      const featuresService = this.owner.lookup('service:features');
      featuresService.enable('byow-pki-hcp-cluster-id');
    });

    test('it correctly populates the cluster id for an hcp dev cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = uuidv4();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hcp.dev`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp int cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = uuidv4();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hcp.to`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      assert.dom('[name="cluster_id"]').hasValue(guid);
    });

    test('it correctly populates the cluster id for an hcp prod cluster', async function (assert) {
      const windowService = this.owner.lookup('service:browser/window');
      const guid = uuidv4();
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      windowService.location.hostname = `${guid}.boundary.hashicorp.cloud`;

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
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
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      assert.dom('[name="cluster_id"]').hasNoValue();
    });

    test('it adds and removes worker tags', async function (assert) {
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};

      const KEY_VALUE_INPUT_SELECTOR = (row, column) =>
        `[name="worker_tags"] tbody :nth-child(${row}) td:nth-child(${column}) input`;
      const KEY_VALUE_BUTTON_SELECTOR = (row) =>
        `[name="worker_tags"] tbody :nth-child(${row}) button`;
      const KEY_VALUE_ROW = '[name="worker_tags"] tbody tr';

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      assert.dom(KEY_VALUE_ROW).exists({ count: 1 });

      // Test adding a worker tag
      await fillIn(KEY_VALUE_INPUT_SELECTOR(1, 1), 'environment');
      await fillIn(KEY_VALUE_INPUT_SELECTOR(1, 2), 'dev');
      await click(KEY_VALUE_BUTTON_SELECTOR(1));

      await fillIn(KEY_VALUE_INPUT_SELECTOR(2, 1), 'environment');
      await fillIn(KEY_VALUE_INPUT_SELECTOR(2, 2), 'test');
      await click(KEY_VALUE_BUTTON_SELECTOR(2));

      assert.dom(KEY_VALUE_ROW).exists({ count: 3 });

      // Remove the worker tag
      await click(KEY_VALUE_BUTTON_SELECTOR(1));

      assert.dom(KEY_VALUE_ROW).exists({ count: 2 });
    });
  },
);
