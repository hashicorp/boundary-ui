import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-status', function (hooks) {
  setupRenderingTest(hooks);
  test('it maps to correct text color, icon and type if it is in active status', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'active' });
    await render(hbs`<SessionStatus @model={{this.model}} />`);
    assert.ok(find('.flight-icon-check'));
    assert.ok(find('.hds-badge--color-success'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in canceling status', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'canceling' });
    await render(hbs`<SessionStatus @model={{this.model}}/>`);
    assert.ok(find('.flight-icon-alert-triangle'));
    assert.ok(find('.hds-badge--color-warning'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in terminated status', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'terminated' });
    await render(hbs`<SessionStatus @model={{this.model}}/>`);
    assert.ok(find('.flight-icon-x'));
    assert.ok(find('.hds-badge--color-critical'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('it maps to correct text color, icon and type if it is in pending status', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'pending' });
    await render(hbs`<SessionStatus @model={{this.model}}/>`);
    assert.ok(find('.flight-icon-delay'));
    assert.ok(find('.hds-badge--color-neutral'));
    assert.ok(find('.hds-badge--type-filled'));
  });

  test('display neutral color and outlined style when it is an unknown status', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    this.model = store.createRecord('session', { status: 'any string' });
    await render(hbs`<SessionStatus @model={{this.model}}/>`);
    assert.notOk(find('.flight-icon'));
    assert.ok(find('.hds-badge--color-neutral'));
    assert.ok(find('.hds-badge--type-outlined'));
  });
});
