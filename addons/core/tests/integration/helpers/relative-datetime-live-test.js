import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | relative-datetime-live', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders relative date in "time" ago format', async function (assert) {
    assert.expect(8);

    const now = Date.now();

    this.date = now - 30 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('30 seconds ago');

    this.date = now - 30 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('30 minutes ago');

    this.date = now - 23 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 hours ago');

    this.date = now - 23 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 days ago');

    this.date = now - 8 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('8 months ago');

    this.date = now - 23 * 12 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 years ago');

    this.date = now + 8 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('in 7 months');

    this.date = now + 23 * 12 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('in 22 years');
  });
});
