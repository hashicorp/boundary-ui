/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RoseCodeEditorToolbarComponent extends Component {
  @action
  copied() {
    this.args.onCopy?.();
  }
}
