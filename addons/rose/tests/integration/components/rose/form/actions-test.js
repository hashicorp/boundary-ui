/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/actions', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a submit button and a regular button', async function (assert) {
    this.cancel = () => {};
    await render(
      hbs`
        <Rose::Form::Actions
          @cancel={{this.cancel}}
          @submitText='Save'
          @cancelText='Cancel'
        />
      `,
    );
    assert.ok(find('[type="submit"]'));
    assert.ok(find('button:not([type="submit"])'));
  });

  test('it can disable the buttons', async function (assert) {
    this.cancel = () => {};
    await render(
      hbs`
        <Rose::Form::Actions
          @cancel={{this.cancel}}
          @submitText='Save'
          @cancelText='Cancel'
          @submitDisabled={{true}}
          @cancelDisabled={{true}}
        />
      `,
    );
    assert.ok(find('[type="submit"]:disabled'));
    assert.ok(find('button:not([type="submit"]):disabled'));
  });

  test('it optionally does not render the cancel button', async function (assert) {
    await render(hbs`
        <Rose::Form::Actions @submitText='Save' @showCancel={{false}} />
    `);
    assert.ok(find('[type="submit"]'));
    assert.notOk(find('button:not([type="submit"])'));
  });

  test('it executes a function on cancel click', async function (assert) {
    assert.expect(1);
    this.cancel = () => assert.ok(true, 'cancel was clicked');
    await render(
      hbs`
        <Rose::Form::Actions
          @cancel={{this.cancel}}
          @submitText='Save'
          @cancelText='Cancel'
        />
      `,
    );
    await click('button:not([type="submit"])');
  });
});
