import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/code-editor/toolbar', function (hooks) {
  setupRenderingTest(hooks);
  const toolbarSelector = '[data-test-code-editor-toolbar]';
  const copyButtonSelector = '[data-test-code-editor-toolbar-copy-button]';
  const menuDividerSelector = '[data-test-code-editor-toolbar-menu-divider]';

  hooks.beforeEach(function () {
    const copyText = 'copyText';
    this.set('copyText', copyText);
  });

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::CodeEditor::Toolbar @copyText={{this.copyText}} />
    `);
    assert.dom(toolbarSelector).isVisible();
    assert.dom(copyButtonSelector).isVisible();
    assert.dom(menuDividerSelector).doesNotExist();
  });

  test('it displays action', async function (assert) {
    await render(hbs`
      <Rose::CodeEditor::Toolbar @onCopy={{this.copyText}}>
        <:action>
          <div data-test-my-action>Hello</div>
        </:action>
      </Rose::CodeEditor::Toolbar>
    `);
    assert.dom(toolbarSelector).isVisible();
    assert.dom(copyButtonSelector).isVisible();
    assert.dom(menuDividerSelector).doesNotExist();
    assert.dom('[data-test-my-action]').isVisible();
  });

  test('it calls onCopy callback', async function (assert) {
    const onCopy = () => {
      this.set('called', true);
    };
    this.set('onCopy', onCopy);
    await render(hbs`
      <Rose::CodeEditor::Toolbar @copyText={{this.copyText}} @onCopy={{this.onCopy}} />
    `);
    assert.dom(toolbarSelector).isVisible();
    assert.dom(copyButtonSelector).isVisible();
    assert.dom(menuDividerSelector).doesNotExist();

    await click(copyButtonSelector);
    assert.true(this.called);
  });
});
