/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormStorageBucketComponent extends Component {
  // =actions

  @action
  updateScope(event) {
    const selectedScopeId = event.target.value;
    const selectedScopeModel = this.args.scopes.find(
      (element) => element.model.id === selectedScopeId
    ).model;
    this.args.model.scopeModel = selectedScopeModel;
  }

  /**
   * Call passed cancel function.
   */
  @action
  cancel() {
    this.args.cancel();
  }
}
