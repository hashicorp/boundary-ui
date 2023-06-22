/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | info-field', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without icon', async function (assert) {
    assert.expect(4);

    await render(
      hbs`
        <InfoField @value="JSON" as |F|>
          <F.Label>Type</F.Label>
          <F.HelperText>Description</F.HelperText>
        </InfoField>
      `
    );
    assert.dom('.info-field').isVisible();
    assert.dom('.info-field .hds-form-label').hasText('Type');
    assert.dom('.info-field .hds-form-helper-text').hasText('Description');
    assert.dom('.info-field .hds-form-text-input').isVisible();
  });

  test('it renders with icon', async function (assert) {
    assert.expect(5);

    await render(
      hbs`
        <InfoField @value="JSON" @icon='apple' as |F|>
          <F.Label>Type</F.Label>
          <F.HelperText>Description</F.HelperText>
        </InfoField>
      `
    );
    assert.dom('.info-field').isVisible();
    assert.dom('.info-field .hds-form-label').hasText('Type');
    assert.dom('.info-field .hds-form-helper-text').hasText('Description');
    assert.dom('[data-test-icon="apple"]').isVisible();
    assert.dom('.info-field .hds-form-text-input').isVisible();
  });
});
