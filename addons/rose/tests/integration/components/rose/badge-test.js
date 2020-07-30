import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/badge', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Badge />`);
    assert.ok(find('.rose-badge'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Badge>host-catalog-1</Rose::Badge>`);
    assert.equal(find('.rose-badge').textContent.trim(), 'host-catalog-1');
  });

  test('it renders an icon using @icon', async function (assert) {
    await render(hbs`<Rose::Badge @icon="chevron-right" />`);
    assert.ok(find('.rose-icon'));
  });

  test('it styles content using @style', async function (assert) {
    let styles = [
      'outline',
      'dark',
      'informational',
      'informational-outline',
      'alert',
      'alert-outline',
      'warning',
      'warning-outline',
      'error',
      'error-outline',
      'success',
      'success-outline',
      'warning',
      'warning-outline',
    ];

    await render(hbs`<Rose::Badge @style={{this.style}} />`);

    styles.forEach((style) => {
      this.set('style', style);
      assert.ok(find(`.rose-badge-${style}`), `defines style: ${style}`);
    });
  });
});
