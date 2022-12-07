import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | relative-datetime-live', function (hooks) {
  setupRenderingTest(hooks);

  let now;

  test.skip('it renders relative date in "time" ago format', async function (assert) {
    assert.expect(8);

    now = Date.now();
    this.date = now - 100 - 30 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('30 seconds ago');

    now = Date.now();
    this.date = now - 1000 - 30 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('30 minutes ago');

    now = Date.now();
    this.date = now - 1000 - 23 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 hours ago');

    now = Date.now();
    this.date = now - 1000 - 23 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 days ago');

    now = Date.now();
    this.date = now - 1000 - 8 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('8 months ago');

    now = Date.now();
    this.date = now - 1000 - 23 * 12 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('23 years ago');

    now = Date.now();
    this.date = now + 7 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('in 7 months');

    now = Date.now();
    this.date = now + 1000 + 22 * 12 * 31 * 24 * 60 * 60 * 1000;
    await render(hbs`{{relative-datetime-live this.date}}`);
    assert.dom(this.element).hasText('in 22 years');
  });
});
