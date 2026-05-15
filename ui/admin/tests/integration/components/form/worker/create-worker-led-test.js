/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, findAll, render } from '@ember/test-helpers';
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

    const ADD_BTN = '[name="worker_tags"] [data-test-add-button]';
    const KEY_VALUE_ROW =
      '[name="worker_tags"] .hds-form-key-value-inputs__row';

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

      const getKeyInputs = () =>
        findAll('[name="worker_tags"] [data-test-key-input]');
      const getValueInputs = () =>
        findAll('[name="worker_tags"] [data-test-value-input]');
      const getDeleteBtns = () =>
        findAll('[name="worker_tags"] [data-test-delete-button]');

      await render(
        hbs`<Form::Worker::CreateWorkerLed @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      // Component starts with 1 seeded empty row
      assert.dom(KEY_VALUE_ROW).exists({ count: 1 });
      await fillIn(getKeyInputs()[0], 'environment');
      await fillIn(getValueInputs()[0], 'dev');

      // Add second worker tag
      await click(ADD_BTN);
      assert.dom(KEY_VALUE_ROW).exists({ count: 2 });
      await fillIn(getKeyInputs()[1], 'environment');
      await fillIn(getValueInputs()[1], 'test');

      // Remove the first worker tag
      await click(getDeleteBtns()[0]);

      assert.dom(KEY_VALUE_ROW).exists({ count: 1 });
    });
  },
);
