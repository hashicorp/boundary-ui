/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form/target/worker-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it only renders a toggle field when "toggleEnabled" is false', async function (assert) {
    assert.expect(2);
    this.onChange = () => {};
    this.toggleAction = () => {};
    await render(
      hbs`<Form::Target::WorkerFilter @name='egress_worker_filter' @toggleEnabled={{false}} @toggleAction={{this.toggleAction}} @onChange={{this.onChange}}/>`
    );

    assert.dom('.hds-form-toggle').isVisible();
    assert.dom('.hds-form-text-input').doesNotExist();
  });

  test('it renders a toggle field and text input field when "toggleEnabled" is true', async function (assert) {
    assert.expect(2);
    this.onChange = () => {};
    this.toggleAction = () => {};
    await render(
      hbs`<Form::Target::WorkerFilter @name='egress_worker_filter' @toggleEnabled={{true}} @toggleAction={{this.toggleAction}} @onChange={{this.onChange}}/>`
    );

    assert.dom('.hds-form-toggle').isVisible();
    assert.dom('.hds-form-text-input').isVisible();
  });
});
