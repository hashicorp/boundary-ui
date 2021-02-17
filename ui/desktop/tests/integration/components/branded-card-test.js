import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | branded-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<BrandedCard />`);
    assert.ok(find('.branded-card'));
    assert.ok(find('.branded-card-title'));
    assert.ok(find('.branded-card-description'));
  });

  test('it renders with content', async function(assert) {
    await render(hbs`<BrandedCard
      @title="title"
      @description="description"
    />`);
    assert.equal(find('.branded-card-title').textContent.trim(), 'title');
    assert.equal(find('.branded-card-description').textContent.trim(), 'description');
  });
});
