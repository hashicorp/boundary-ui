/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * Returns grants currently on model, in addition to
   * grants added (or deleted) interactively by user -
   * before form submission
   * @return {[string]}
   */
  get grants() {
    return this.args.model.grant_strings.join('\n');
  }
}
