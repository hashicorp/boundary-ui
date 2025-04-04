/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/dialog/cover', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Dialog::Cover>
        <:header>
          <Hds::Text::Display
            @tag='h1'
          >Authentication Pending</Hds::Text::Display>
        </:header>
        <:body>
          <p>Complete authentication in the newly-opened window.</p>
          <p>Don't see the new window?  <a href="#">Try again.</a></p>
          <p><a href="#">Cancel</a></p>
        </:body>
      </Rose::Dialog::Cover>
    `);

    assert.ok(find('.rose-dialog-cover'));
    assert.ok(find('.rose-dialog-cover-header'));
    assert.ok(find('.rose-dialog-cover-body'));
  });
});
