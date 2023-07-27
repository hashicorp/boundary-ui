/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
    assert.dom('.rose-layout-body-content').exists();
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::BodyContent id="body-content"/>`);

    assert.dom('#body-content').exists();
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::BodyContent as |bc|>
      <bc.Body><button id="button" /></bc.Body>
      <bc.Sidebar><p id="details">Resource Details</p></bc.Sidebar>
    </Rose::Layout::BodyContent>`);

    assert.dom('.rose-layout-body-content-body #button').exists();
    assert.dom('.rose-layout-body-content-sidebar #details').exists();
  });
});
