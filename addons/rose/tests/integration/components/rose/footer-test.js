import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer', function(hooks) {
  setupRenderingTest(hooks);
  
  test('it renders', async function (assert) {
    assert.expect(5);
    await render(hbs`<Rose::Footer />`);
    assert.ok(find('.rose-footer'));
    assert.notOk(find('.rose-footer-nav'));
    assert.notOk(find('.rose-footer-brand'));
    assert.notOk(find('.rose-footer-product'));
    assert.notOk(find('.rose-footer-copyright'));
  });

  test('it renders with brand', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer| >
      <footer.brand />
    </Rose::Footer>`);
    assert.ok(find('.rose-footer-brand'));
  });

  test('it renders with nav', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer| >
      <footer.nav />
    </Rose::Footer>`);
    assert.ok(find('.rose-footer-nav'));
  });

  test('it renders with product', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer| >
      <footer.product @text="boundary"/>
    </Rose::Footer>`);
    assert.ok(find('.rose-footer-product'));
  });

  test('it renders with copyright', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer as |footer| >
      <footer.copyright @text="copyright"/>
    </Rose::Footer>`);
    assert.ok(find('.rose-footer-copyright'));
  });

});
