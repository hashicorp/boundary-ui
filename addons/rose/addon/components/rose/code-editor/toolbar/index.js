/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export const COPY_ICON_TYPE = 'clipboard-copy';
export const COPIED_ICON_TYPE = 'clipboard-checked';

export default class RoseCodeEditorToolbarComponent extends Component {
  @tracked copyIconType = COPY_ICON_TYPE;

  @action
  copied() {
    let { onCopy } = this.args;
    let originalIconType = this.copyIconType;

    this.copyIconType = COPIED_ICON_TYPE;

    if (onCopy) {
      onCopy();
    }
    // eslint-disable-next-line ember/no-runloop
    later(() => (this.copyIconType = originalIconType), 1000);
  }
}
