/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | info-field', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('label', 'Type');
    this.set('helperText', 'Description');
  });

  test('it renders without icon', async function (assert) {
    await render(
      hbs`
        <InfoField @value="JSON" as |F|>
          <F.Label>{{this.label}}</F.Label>
          <F.HelperText>{{this.helperText}}</F.HelperText>
        </InfoField>
      `,
    );
    assert.dom('.info-field').isVisible();
    assert.dom('.info-field .hds-form-label').hasText('Type');
    assert.dom('.info-field .hds-form-helper-text').hasText('Description');
    assert.dom('.info-field .hds-form-text-input').isVisible();
  });

  test('it renders with icon', async function (assert) {
    await render(
      hbs`
        <InfoField @value="JSON" @icon='apple' as |F|>
          <F.Label>{{this.label}}</F.Label>
          <F.HelperText>{{this.helperText}}</F.HelperText>
        </InfoField>
      `,
    );
    assert.dom('.info-field').isVisible();
    assert.dom('.info-field .hds-form-label').hasText('Type');
    assert.dom('.info-field .hds-form-helper-text').hasText('Description');
    assert.dom('[data-test-icon="apple"]').isVisible();
    assert.dom('.info-field .hds-form-text-input').isVisible();
  });
});
