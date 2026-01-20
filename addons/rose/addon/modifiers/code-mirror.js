/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Modifier from 'ember-modifier';
import codemirror from 'codemirror';

import '../utilities/register-codemirror-hcl';
import 'codemirror/mode/go/go';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

// Here we define default options for the editor.
// These should follow the codemirror configuration types
//
const _PRESET_DEFAULTS = {
  theme: 'monokai',
  lineNumbers: true,
  cursorBlinkRate: 500,
  matchBrackets: true,
  autoCloseBrackets: true,
  styleActiveLine: true,
  mode: 'hcl',
};

/**
 *
 * `CodeMirror` implements a modifier that creates a CodeMirror instance on the provided element.
 *
 * The supported modes for the editor are currently: hcl, shell, go, javascript
 * The supported themes are: monokai
 *
 * Sample usage:
 * ```
 * <div
 *   {{code-mirror value=@value onInput=@onInput options=@options}}
 * />
 * ```
 *
 * @class CodeMirror
 *
 */
export default class CodeMirrorModifier extends Modifier {
  _editor;
  didSetup = false;

  modify(element, _, named) {
    if (!this.didSetup) {
      this._setup(element, named);
      this.didSetup = true;
    }

    if (this._editor?.getValue() !== named.value) {
      this._editor?.setValue(named.value);
    }
  }

  /**
   * Called when editor contents change.
   * @method CodeMirror#_onChange
   * See documentation for the CodeMirror editor events, specifically 'change' event here https://codemirror.net/doc/manual.html#events.
   */
  _onChange(editor, named) {
    const { onInput } = named;
    const newVal = editor.getValue();

    onInput && onInput(newVal);
  }

  /**
   * Initializes the editor with default configuration merged with consumer-provided configuration.
   * Also registers a 'change' event on the editor.
   * @method CodeMirror#_setup
   */
  _setup(element, named) {
    if (!element) {
      throw new Error('CodeMirror modifier has no element');
    }

    const editor = codemirror(element, {
      ..._PRESET_DEFAULTS,
      ...(named.options || {}),
      value: named.value,
    });

    editor.on('change', (editor) => {
      this._onChange(editor, named);
    });

    this._editor = editor;
  }
}
