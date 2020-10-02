import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Modifier | on-click-inside', function (hooks) {
  setupRenderingTest(hooks);

  test('it fires event when inside is clicked', async function (assert) {
    assert.expect(2);
    this.set('clickedInside', (element) => {
      assert.ok(element);
      assert.equal(element.id, 'inside');
    });
    await render(hbs`
      <div id="outside"></div>
      <div id="inside" {{on-click-inside this.clickedInside}}>
        <div id="item" />
      </div>
    `);
    await click('#item');
  });

  test('it does not fire event when outside is clicked', async function (assert) {
    assert.expect(0);
    this.set('clickedInside', () => {
      assert.ok(true);
    });
    await render(hbs`
      <div id="outside"></div>
      <div id="inside" {{on-click-inside this.clickedInside}}>
        <div id="item" />
      </div>
    `);
    await click('#outside');
  });
});
