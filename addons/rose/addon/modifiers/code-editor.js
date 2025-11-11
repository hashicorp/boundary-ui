/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
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
 * Creates the extensions array based on configuration
 */
function createExtensions(options, onChange, lint, extensions) {
  const extensionsList = [basicSetup];

  // Add language support
  const languageExtension = LANGUAGE_EXTENSIONS[options.mode];
  if (languageExtension) {
    extensionsList.push(languageExtension);
  }

  // Add theme
  const themeExtension = THEME_EXTENSIONS[options.theme];
  if (themeExtension) {
    extensionsList.push(themeExtension);
  }

  // Add autocompletion with custom completions
  if (options.autocomplete) {
    const autocompletionConfig = {
      override: [myCompletions],
      closeOnBlur: true,
    };

    extensionsList.push(autocompletion(autocompletionConfig));
    extensionsList.push(keymap.of(completionKeymap));
  }

  // Add read-only mode
  if (options.readOnly) {
    extensionsList.push(EditorState.readOnly.of(true));
  }

  // Add update listener for onChange callback
  if (onChange) {
    extensionsList.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          onChange(newValue);
        }
      }),
    );
  }

  // Add linting if configured
  if (lint) {
    const lintExtension = linter(() => []);
    extensionsList.push(lintExtension);
  }

  // Add custom extensions if provided
  if (extensions) {
    extensionsList.push(...extensions);
  }

  return extensionsList;
}

/**
 * CodeMirror editor modifier for Rose components
 *
 * @example
 * <div {{code-editor
 *   value=this.codeValue
 *   onChange=this.handleCodeChange
 *   mode="javascript"
 *   theme="one-dark"
 *   completions=this.customCompletions
 *   lineNumbers=true
 *   readOnly=false
 * }}></div>
 */
export default class CodeEditorModifier extends Modifier {
  editor = null;
  currentValue = '';

  constructor(owner, args) {
    super(owner, args);

    // Register destructor for proper cleanup
    registerDestructor(this, () => {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    });
  }

  #setup(element, named) {
    const {
      value = '',
      onChange,
      mode = 'javascript',
      theme = 'one-dark',
      lineNumbers = true,
      readOnly = false,
      autocomplete = true,
      lint,
      extensions,
    } = named;

    this.currentValue = value;

    const options = {
      mode,
      theme,
      lineNumbers,
      readOnly,
      autocomplete,
    };

    // Create extensions
    const extensionsList = createExtensions(
      options,
      onChange,
      lint,
      extensions,
    );

    // Create initial state
    const state = EditorState.create({
      doc: value,
      extensions: extensionsList,
    });

    // Create editor view
    this.editor = new EditorView({
      state,
      parent: element,
    });
  }

  modify(element, _positional, named) {
    // Setup editor on first run
    if (!this.editor) {
      this.#setup(element, named);
      return;
    }

    const { value = '' } = named;

    // Update editor value if it changed externally
    if (value !== this.currentValue) {
      this.currentValue = value;

      const transaction = this.editor.state.update({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: this.currentValue,
        },
      });

      this.editor.dispatch(transaction);
    }
  }
}
