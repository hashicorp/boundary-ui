/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { linter } from '@codemirror/lint';

function myCompletions(context) {
  let word = context.matchBefore(/\w*/);
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: 'target name1', type: 'keyword' },
      { label: 'target name 2', type: 'variable', detail: 't_987654321' },
      {
        label: 'target name 3',
        type: 'text',
        apply: 't_123456789',
        info: 't_123456789',
      },
    ],
  };
}

/**
 * Language mode mappings for CodeMirror 6
 */
const LANGUAGE_EXTENSIONS = {
  javascript: javascript(),
};

/**
 * Theme mappings for CodeMirror 6
 */
const THEME_EXTENSIONS = {
  monokai: oneDark,
  'one-dark': oneDark,
};

/**
 * Rose CodeEditor component using CodeMirror 6 with custom autocomplete support
 *
 * @example
 * <Rose::CodeEditor
 *   @value={{this.codeValue}}
 *   @onChange={{this.handleCodeChange}}
 *   @mode="javascript"
 *   @theme="one-dark"
 *   @completions={{this.customCompletions}}
 *   @lineNumbers={{true}}
 *   @readOnly={{false}}
 * />
 *
 * @class RoseCodeEditorComponent
 */
export default class RoseCodeEditorComponent extends Component {
  @tracked _editor = null;
  @tracked _currentValue = '';

  /**
   * Default configuration options
   */
  get defaultOptions() {
    return {
      mode: 'javascript',
      theme: 'one-dark',
      lineNumbers: true,
      readOnly: false,
      autocomplete: true,
    };
  }

  /**
   * Merged options from defaults and arguments
   */
  get options() {
    return {
      ...this.defaultOptions,
      mode: this.args.mode || this.defaultOptions.mode,
      theme: this.args.theme || this.defaultOptions.theme,
      lineNumbers: this.args.lineNumbers ?? this.defaultOptions.lineNumbers,
      readOnly: this.args.readOnly ?? this.defaultOptions.readOnly,
      autocomplete: this.args.autocomplete ?? this.defaultOptions.autocomplete,
    };
  }

  /**
   * Custom completion source that uses provided completions
   */
  customCompletionSource = (context) => {
    const { completions } = this.args;

    if (!completions || !Array.isArray(completions)) {
      return null;
    }

    const word = context.matchBefore(/\w*/);
    if (word.from === word.to && !context.explicit) {
      return null;
    }

    const currentWord = word.text.toLowerCase();

    // Filter completions based on current input
    const filteredCompletions = completions
      .filter((completion) => {
        const label =
          typeof completion === 'string' ? completion : completion.label;
        return label.toLowerCase().startsWith(currentWord);
      })
      .map((completion) => {
        if (typeof completion === 'string') {
          return {
            label: completion,
            type: 'keyword',
          };
        }
        return completion;
      });

    if (filteredCompletions.length === 0) {
      return null;
    }

    return {
      from: word.from,
      options: filteredCompletions,
    };
  };

  /**
   * Creates the extensions array based on configuration
   */
  createExtensions() {
    const extensions = [basicSetup];
    const { options } = this;

    // Add language support
    const languageExtension = LANGUAGE_EXTENSIONS[options.mode];
    if (languageExtension) {
      extensions.push(languageExtension);
    }

    // Add theme
    const themeExtension = THEME_EXTENSIONS[options.theme];
    if (themeExtension) {
      extensions.push(themeExtension);
    }

    // Add autocompletion with custom completions
    if (options.autocomplete) {
      const autocompletionConfig = {
        override: [myCompletions],
        closeOnBlur: true,
      };

      extensions.push(autocompletion(autocompletionConfig));
      extensions.push(keymap.of(completionKeymap));
    }

    // Add read-only mode
    if (options.readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    // Add update listener for onChange callback
    if (this.args.onChange) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            this._currentValue = newValue;
            this.args.onChange(newValue);
          }
        }),
      );
    }

    // Add linting if configured
    if (this.args.lint) {
      const lintExtension = linter(() => []);
      extensions.push(lintExtension);
    }

    // Add custom extensions if provided
    if (this.args.extensions) {
      extensions.push(...this.args.extensions);
    }

    return extensions;
  }

  /**
   * Sets up the CodeMirror editor
   */
  @action
  setupEditor(element) {
    if (!element || this._editor) {
      return;
    }

    this._currentValue = this.args.value || '';

    const extensions = this.createExtensions();

    const state = EditorState.create({
      doc: this._currentValue,
      extensions,
    });

    this._editor = new EditorView({
      state,
      parent: element,
    });
  }

  /**
   * Updates the editor value when the external value changes
   */
  @action
  updateValue() {
    const newValue = this.args.value || '';

    if (this._editor && newValue !== this._currentValue) {
      this._currentValue = newValue;

      const transaction = this._editor.state.update({
        changes: {
          from: 0,
          to: this._editor.state.doc.length,
          insert: this._currentValue,
        },
      });

      this._editor.dispatch(transaction);
    }
  }

  /**
   * Cleanup when component is destroyed
   */
  willDestroy() {
    super.willDestroy();
    if (this._editor) {
      this._editor.destroy();
      this._editor = null;
    }
  }
}
