/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-filter-generator/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    const CODE_EDITOR = '[data-test-code-editor-field-editor]';
    const CODE_EDITOR_LINE =
      '[data-test-code-editor-field-editor] .CodeMirror-line';
    const FILTER_GENERATOR = '[name="filter_generator"]';
    const SHOW_FILTER_GENERATOR = '[name="show_filter_generator"]';
    const TAG_TYPE_OPTION = '[value="tag"]';
    const NAME_TYPE_OPTION = '[value="name"]';
    const TAG_KEY = '[name="tag_key"]';
    const TAG_VALUE = '[name="tag_value"]';
    const NAME_OPERATOR = '[name="name_operator"]';
    const GENERATED_VALUE = '[name="generated_value"]';

    test('it renders correct content when egress_worker_filter is passed in', async function (assert) {
      this.model = { egress_worker_filter: 'egress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='egress_worker_filter' @model={{this.model}} />`,
      );

      assert.dom(CODE_EDITOR).isVisible();
      assert.dom(CODE_EDITOR_LINE).hasText(this.model.egress_worker_filter);
    });

    test('it renders correct content when ingress_worker_filter is passed in', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      assert.dom(CODE_EDITOR).isVisible();
      assert.dom(CODE_EDITOR_LINE).hasText(this.model.ingress_worker_filter);
    });

    test('toggleFilterGenerator shows filter generator when toggled on', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      assert.dom(FILTER_GENERATOR).isVisible();

      await click(SHOW_FILTER_GENERATOR);

      assert.dom(FILTER_GENERATOR).isNotVisible();
    });

    test('filter generator tag type shows key and value input boxes', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      await click(TAG_TYPE_OPTION);

      assert.dom(TAG_KEY).isVisible();
      assert.dom(TAG_VALUE).isVisible();
      assert.dom(NAME_OPERATOR).isNotVisible();
    });

    test('filter generator tag type generates correctly formatted filter', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      await click(TAG_TYPE_OPTION);
      await fillIn(TAG_KEY, 'key1');
      await fillIn(TAG_VALUE, 'val1');

      assert.dom(GENERATED_VALUE).hasValue('"val1" in "/tags/key1"');
    });

    test('filter generator name type shows operator and value fields', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      await click(NAME_TYPE_OPTION);

      assert.dom(NAME_OPERATOR).isVisible();
      assert.dom(TAG_VALUE).isVisible();
      assert.dom(TAG_KEY).isNotVisible();
    });

    test('filter generator name type generates correctly formatted filter', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      await click(NAME_TYPE_OPTION);
      await fillIn(TAG_VALUE, 'val1');
      await select(NAME_OPERATOR, '==');

      assert.dom(GENERATED_VALUE).hasValue('"/name" == "val1"');
    });

    test('generated result is cleared when switching filter types', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      await click(SHOW_FILTER_GENERATOR);

      await click(NAME_TYPE_OPTION);
      await fillIn(TAG_VALUE, 'val1');
      await select(NAME_OPERATOR, '==');

      assert.dom(GENERATED_VALUE).hasValue('"/name" == "val1"');

      await click(TAG_TYPE_OPTION);

      assert.dom(GENERATED_VALUE).hasNoValue();
    });

    test('filter generator is toggled on when showFilterGenerator is true and can be hidden', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      this.showFilterGenerator = true;
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} @showFilterGenerator={{this.showFilterGenerator}} />`,
      );

      assert.dom(FILTER_GENERATOR).isVisible();

      await click(SHOW_FILTER_GENERATOR);

      assert.dom(FILTER_GENERATOR).isNotVisible();
    });

    test('filter generator is not toggled when showFilterGenerator is not provided and can be shown', async function (assert) {
      this.model = { ingress_worker_filter: 'ingress filter' };
      await render(
        hbs`<WorkerFilterGenerator @name='ingress_worker_filter' @model={{this.model}} />`,
      );

      assert.dom(FILTER_GENERATOR).isNotVisible();

      await click(SHOW_FILTER_GENERATOR);

      assert.dom(FILTER_GENERATOR).isVisible();
    });
  },
);
