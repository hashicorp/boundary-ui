/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | worker-filter/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders correct content when egress_worker_filter is passed in', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { egress_worker_filter: 'egress filter' };
    await render(
      hbs`<WorkerFilter @name='egress_worker_filter' @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
    );

    assert.dom('[data-test-code-editor-field-editor]').isVisible();
    assert
      .dom('[data-test-code-editor-field-editor] .CodeMirror-line')
      .hasText(this.model.egress_worker_filter);
  });

  test('it renders correct content when ingress_worker_filter is passed in', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { ingress_worker_filter: 'ingress filter' };
    await render(
      hbs`<WorkerFilter @name='ingress_worker_filter' @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}}/>`,
    );

    assert.dom('[data-test-code-editor-field-editor]').isVisible();
    assert
      .dom('[data-test-code-editor-field-editor] .CodeMirror-line')
      .hasText(this.model.ingress_worker_filter);
  });

  test('toggleFilterGenerator shows filter generator when toggled on', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { ingress_worker_filter: 'ingress filter' };
    await render(
      hbs`<WorkerFilter @name='ingress_worker_filter' @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}}/>`,
    );

    assert.dom('[name="filter_generator"]').isNotVisible();

    await click('[name="show_filter_generator"]');

    assert.dom('[name="filter_generator"]').isVisible();
  });

  test('filter generator tag type shows key and value input boxes', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { ingress_worker_filter: 'ingress filter' };
    await render(
      hbs`<WorkerFilter @name='ingress_worker_filter' @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}}/>`,
    );
    await click('[name="show_filter_generator"]');
    await click('[value="tag"]');

    assert.dom('[name="tag_key"]').isVisible();
    assert.dom('[name="tag_value"]').isVisible();
  });

  test('filter generator tag type generates correctly formatted filter', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { ingress_worker_filter: 'ingress filter' };
    await render(
      hbs`<WorkerFilter @name='ingress_worker_filter' @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}}/>`,
    );
    await click('[name="show_filter_generator"]');
    await click('[value="tag"]');
    await fillIn('[name="tag_key"]', 'key1');
    await fillIn('[name="tag_value"]', 'val1');

    assert.dom('[name="generated_value"]').hasValue('"val1" in "/tags/key1"');
  });
});
