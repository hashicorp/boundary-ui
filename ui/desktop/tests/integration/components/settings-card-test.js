/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | settings card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SettingsCard 
        @header='This is a heading test'
        @icon='boundary'/>`);
    assert.ok(find('.settings-card'));
  });

  test('header renders an icon when defined', async function (assert) {
    await render(hbs`
      <SettingsCard
        @header='This is a heading test'
        @icon='boundary'>
      </SettingsCard>
    `);

    assert.ok(find('.settings-card'));
    assert.ok(find('.header-and-icon'));
    assert.strictEqual(
      this.element.textContent.trim(),
      'This is a heading test',
    );
  });
});
