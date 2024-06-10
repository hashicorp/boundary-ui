/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/layout/body-content', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::BodyContent />`);

    assert.dom('div').exists();
    assert.dom('.rose-layout-body-content').isVisible();
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::BodyContent id="body-content"/>`);

    assert.dom('#body-content').isVisible();
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::BodyContent as |bc|>
      <bc.Body><button id="button" type="button" /></bc.Body>
      <bc.Sidebar><p id="details">Resource Details</p></bc.Sidebar>
    </Rose::Layout::BodyContent>`);

    assert.dom('.rose-layout-body-content-body #button').isVisible();
    assert.dom('.rose-layout-body-content-sidebar #details').isVisible();
    assert
      .dom('.rose-layout-body-content-sidebar #details')
      .hasText('Resource Details');
  });
});
