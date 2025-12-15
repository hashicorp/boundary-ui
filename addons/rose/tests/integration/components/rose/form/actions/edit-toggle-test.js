/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | rose/form/actions/edit-toggle',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders a regular button', async function (assert) {
      this.enableEdit = () => {};
      await render(
        hbs`
          <Rose::Form::Actions::EditToggle
            @enableEdit={{this.enableEdit}}
            @enableEditText='Edit'
          />
        `,
      );
      assert.ok(find('button'));
    });

    test('it executes a function on button click', async function (assert) {
      assert.expect(1);
      this.enableEdit = () => assert.ok(true, 'edit was clicked');
      await render(
        hbs`
          <Rose::Form::Actions::EditToggle
            @enableEdit={{this.enableEdit}}
            @enableEditText='Edit'
          />
        `,
      );
      await click('button');
    });
  },
);
