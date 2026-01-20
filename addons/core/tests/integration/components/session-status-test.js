/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | session-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it maps to correct text color, icon and type if it is in active status', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'active' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.ok(find('.hds-icon-check'));
    assert.ok(find('.hds-badge--color-success'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in canceling status', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'canceling' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.ok(find('.hds-icon-alert-triangle'));
    assert.ok(find('.hds-badge--color-warning'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in terminated status', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'terminated' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.ok(find('.hds-icon-x'));
    assert.ok(find('.hds-badge--color-critical'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in pending status', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'pending' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.ok(find('.hds-icon-delay'));
    assert.ok(find('.hds-badge--color-neutral'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('display neutral color and outlined style when it is an unknown status', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'any string' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.notOk(find('.hds-icon'));
    assert.ok(find('.hds-badge--color-neutral'));
    assert.ok(find('.hds-badge--type-outlined'));
  });
});
