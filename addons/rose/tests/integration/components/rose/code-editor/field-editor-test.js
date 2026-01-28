/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { typeIn, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | rose/code-editor/field-editor',
  function (hooks) {
    setupRenderingTest(hooks);
    const editorSelector = '[data-test-code-editor-field-editor]';

    test('it renders', async function (assert) {
      const codeValue = `export HCP_CLIENT_ID = {place your client_id here}`;
      this.set('codeValue', codeValue);
      await render(hbs`
      <Rose::CodeEditor::FieldEditor @value={{this.codeValue}} />
    `);
      assert.dom(editorSelector).isVisible();
      assert.dom(editorSelector).includesText(codeValue);

      const myNewCode = 'NEW CODE';
      await typeIn(`${editorSelector} textarea`, myNewCode);
      assert.dom(editorSelector).includesText(myNewCode);
    });

    test('it renders readonly', async function (assert) {
      const codeValue = `export HCP_CLIENT_ID = {place your client_id here}`;
      this.set('codeValue', codeValue);
      this.set('options', {
        readOnly: true,
      });
      await render(hbs`
      <Rose::CodeEditor::FieldEditor @value={{this.codeValue}} @options={{this.options}} />
    `);
      assert.dom(editorSelector).isVisible();
      assert.dom(editorSelector).includesText(codeValue);

      const myNewCode = 'NEW CODE';
      waitUntil(async () => {
        try {
          // This should fail if the textarea is readonly
          await typeIn(`${editorSelector} textarea`, myNewCode);
        } catch {
          return true;
        }
      });
      assert.dom(editorSelector).doesNotIncludeText(myNewCode);
    });

    test('it calls onInput on change', async function (assert) {
      const codeValue = `export HCP_CLIENT_ID = {place your client_id here}`;
      const onInput = () => {
        this.set('called', true);
      };
      this.set('codeValue', codeValue);
      this.set('onInput', onInput);
      await render(hbs`
      <Rose::CodeEditor::FieldEditor @value={{this.codeValue}} @onInput={{this.onInput}} />
    `);
      assert.dom(editorSelector).isVisible();
      assert.dom(editorSelector).includesText(codeValue);

      const myNewCode = 'NEW CODE';
      await typeIn(`${editorSelector} textarea`, myNewCode);
      assert.dom(editorSelector).includesText(myNewCode);
      assert.true(this.called);
    });
  },
);
