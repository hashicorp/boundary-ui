/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormRoleManageOrgProjectsIndexComponent extends Component {
  // =attributes

  get selectedProjectsCount() {
    const { role, remainingProjectIDs } = this.args.model;
    return role.grantScopeProjectIDs.length - remainingProjectIDs.length;
  }

  // =actions

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates }) {
    const { role } = this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = role.grant_scope_ids.includes(key);
      if (isSelected && !includesId) {
        role.grant_scope_ids = [...role.grant_scope_ids, key];
      } else if (!isSelected && includesId) {
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== key,
        );
      }
    });
  }
}
