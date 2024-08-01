/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  get allGrantScopes() {
    return [
      ...this.args.model.role.grantScopeKeywords,
      ...this.args.model.role.grantScopeProjectIDs,
      ...this.args.selectedItems,
    ];
  }

  // =actions

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates }) {
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      // If index is equal to -1 then key does not exist in the array.
      const index = this.args.selectedItems.indexOf(key);
      if (isSelected) {
        if (index === -1) {
          this.args.selectedItems.push(key);
        }
      } else if (index !== -1) {
        const index = this.args.selectedItems.indexOf(key);
        this.args.selectedItems.splice(index, 1);
      }
    });
  }
}
