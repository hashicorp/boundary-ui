/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

/**
 * The can helper override in admin is exported only in a development
 * environment, never in tests or production.  This is a simple smoke test
 * to ensure that it still functions as intended.
 */
module('Integration | Helper | can', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const model = {
      authorized_actions: ['read'],
      authorized_collection_actions: {
        resource: ['list'],
      },
    };

    this.set('read', 'Read');
    this.set('list', 'List');
    this.set('model', model);

    await render(hbs`
      {{#if (can 'read model' this.model)}}
        {{this.read}}
      {{/if}}
    `);

    assert.dom(this.element).hasText('Read');

    await render(hbs`
      {{#if (can 'list model' this.model collection='resource')}}
        {{this.list}}
      {{/if}}
    `);

    assert.dom(this.element).hasText('List');
  });
});
