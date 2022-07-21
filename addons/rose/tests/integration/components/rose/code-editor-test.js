import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/code-editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    let codeValue = 'export HCP_CLIENT_ID = {place your client_id here}';
    this.set('codeValue', codeValue);

    await render(hbs`
      <Rose::CodeEditor
        @codeValue={{this.codeValue}}
        as |C|
      >
        <C.Toolbar />
        <C.FieldEditor />
      </Rose::CodeEditor>
    `);
    assert.dom('[data-test-code-editor]').isVisible();
    assert.dom('[data-test-code-editor-toolbar]').isVisible();
    assert.dom('[data-test-code-editor-field-editor]').isVisible();
    assert.dom('[data-test-code-editor-field-editor]').includesText(codeValue);
  });
});
