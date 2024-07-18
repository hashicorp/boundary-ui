/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

export default class FormRoleManageScopesIndexComponent extends Component {
  // =attributes

  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  @tracked selectedItems = [...this.args.model.grant_scope_ids];

  /**
   * Returns true if role is global level and either
   * "children" or "descendants" is toggled on.
   * @type {boolean}
   */
  get showAlert() {
    return (
      this.args.model.scope.isGlobal &&
      (this.selectedItems.includes(GRANT_SCOPE_CHILDREN) ||
        this.selectedItems.includes(GRANT_SCOPE_DESCENDANTS))
    );
  }

  // =actions

  /**
   * Handles toggle event changes for selectedGrantScopeIDs
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { checked, value } = event.target;
    const removeValue = (value) => {
      this.selectedItems = this.selectedItems.filter((item) => item !== value);
    };
    if (checked) {
      this.selectedItems = [...this.selectedItems, value];
      if (value === GRANT_SCOPE_CHILDREN) {
        removeValue(GRANT_SCOPE_DESCENDANTS);
      }
      if (value === GRANT_SCOPE_DESCENDANTS) {
        removeValue(GRANT_SCOPE_CHILDREN);
      }
    } else {
      removeValue(value);
    }
  }
}
