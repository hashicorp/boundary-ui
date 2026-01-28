/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | form/worker/create-tags/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    const SAVE_BUTTON_SELECTOR = '[type="submit"]';
    const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';

    test('it renders', async function (assert) {
      this.model = {};
      this.apiTags = [];
      this.save = () => {};
      this.cancel = () => {};

      await render(
        hbs`<Form::Worker::CreateTags @model={{this.model}} @apiTags={{this.apiTags}} @submit={{this.save}} @cancel={{this.cancel}} />`,
      );

      assert
        .dom(this.element)
        .includesText('Key Value Actions Add Save Cancel');
    });

    test('it calls the passed in save action', async function (assert) {
      this.model = {};
      this.apiTags = [{ key: 'key', value: 'value' }];
      this.save = () => {
        this.set('called', true);
      };
      this.cancel = () => {};

      await render(
        hbs`<Form::Worker::CreateTags @model={{this.model}} @apiTags={{this.apiTags}} @submit={{this.save}} @cancel={{this.cancel}} />`,
      );

      await click(SAVE_BUTTON_SELECTOR);

      assert.true(this.called);
    });

    test('it calls the passed in cancel action', async function (assert) {
      this.model = {};
      this.apiTags = [];
      this.save = () => {};
      this.cancel = () => {
        this.set('called', true);
      };

      await render(
        hbs`<Form::Worker::CreateTags @model={{this.model}} @apiTags={{this.apiTags}} @submit={{this.save}} @cancel={{this.cancel}} />`,
      );

      await click(CANCEL_BUTTON_SELECTOR);

      assert.true(this.called);
    });
  },
);
