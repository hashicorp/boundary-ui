import Modifier from 'ember-modifier';
import codemirror from 'codemirror';

import '../utilities/register-codemirror-hcl';
import 'codemirror/mode/go/go';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/active-line';

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

  didInstall() {
    this._setup();
  }

  didUpdateArguments() {
    if (this._editor?.getValue() !== this.args.named.value) {
      this._editor?.setValue(this.args.named.value);
    }
  }

  /**
   * Called when editor contents change.
   * @method CodeMirror#_onChange
   * See documentation for the CodeMirror editor events, specifically 'change' event here https://codemirror.net/doc/manual.html#events.
   */
  _onChange(editor) {
    const { onInput } = this.args.named;
    const newVal = editor.getValue();
    onInput && onInput(newVal);
  }

  /**
   * Initializes the editor with default configuration merged with consumer-provided configuration.
   * Also registers a 'change' event on the editor.
   * @method CodeMirror#_setup
   */
  _setup() {
    if (!this.element) {
      throw new Error('CodeMirror modifier has no element');
    }

    const editor = codemirror(this.element, {
      ..._PRESET_DEFAULTS,
      ...(this.args.named.options || {}),
      value: this.args.named.value,
    });

    editor.on('change', (editor) => {
      this._onChange(editor);
    });

    this._editor = editor;
  }
}
