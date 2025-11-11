/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import templateOnlyComponent from '@ember/component/template-only';

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
 */
export default templateOnlyComponent();
