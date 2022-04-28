import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | relative-datetime-live', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a relative datetime', async function (assert) {
    assert.expect(6);

    const now = Date.now();

    this.date = now - 10 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 seconds ago');

    this.date = now - 10 * 60 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 minutes ago');

    this.date = now - 10 * 60 * 60 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 hours ago');

    this.date = now - 10 * 24 * 60 * 60 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 days ago');

    this.date = now - 10 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 months ago');

    this.date = now - 10 * 12 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`<RelativeDatetimeLive @date={{this.date}} />`);
    assert.dom(this.element).hasText('10 years ago');
  });
});
