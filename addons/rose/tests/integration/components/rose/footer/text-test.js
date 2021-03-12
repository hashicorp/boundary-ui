import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer|>
      <footer.text />
    </Rose::Footer>`);
    assert.ok(find('.rose-footer-text'));
  });

  test('it renders content', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer|>
      <footer.text>content</footer.text>
    </Rose::Footer>`);
    assert.equal(find('.rose-footer-text').textContent.trim(), 'content');
  });
});
