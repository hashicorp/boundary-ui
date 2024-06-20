/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  @tracked selectedItems = [...this.args.model.role.grantScopeOrgIDs];

  get allGrantScopes() {
    return [
      ...this.args.model.role.grantScopeKeywords,
      ...this.args.model.role.grantScopeProjectIDs,
      ...this.selectedItems,
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
      const includesId = this.selectedItems.includes(key);
      if (isSelected) {
        if (!includesId) this.selectedItems = [...this.selectedItems, key];
      } else if (includesId) {
          this.selectedItems = this.selectedItems.filter(
            (item) => item !== key,
          );
      }
    });
  }
}