import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Modifier | on-click-outside', function (hooks) {
  setupRenderingTest(hooks);

  test('it fires event when an outside element is clicked', async function (assert) {
    assert.expect(2);
    this.set('clickedOutside', (element, event) => {
      assert.ok(element);
      assert.equal(event.target.id, 'outside');
    });

    await render(hbs`<div id="outside"></div>
    <div id="inside" {{on-click-outside this.clickedOutside}}></div>`);

    await click('#outside');
  });

  test('it does not fire event when element is clicked', async function (assert) {
    assert.expect(1);
    this.set('clickedOutside', () => {
      assert.ok(true);
    });

    await render(hbs`<div id="outside"></div>
    <div id="inside" {{on-click-outside this.clickedOutside}}>
      <div id="item" />
    </div>`);

    await click('#inside');
    await click('#item');
    await click('#outside');
  });
});
