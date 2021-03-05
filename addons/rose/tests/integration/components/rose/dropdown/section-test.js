import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/dropdown/section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Dropdown::Section>
        template block text
      </Rose::Dropdown::Section>
    `);
    assert.ok(find('.rose-dropdown-section'));
    assert.equal(this.element.textContent.trim(), 'template block text');
  });

  test('it renders with optional @title', async function (assert) {
    await render(hbs`
      <Rose::Dropdown::Section @title="Section Title">
        template block text
      </Rose::Dropdown::Section>
    `);
    assert.equal(
      find('.rose-dropdown-section-title').textContent.trim(),
      'Section Title'
    );
  });
});
